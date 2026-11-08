import type Docker from 'dockerode'
import type { Lab, DockerTarget } from '@/domain'
import { sessions } from './sessions.store'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'
import { getDockerClient } from './docker.client'

export interface EnvironmentHandle {
  kaliId: string
  networkId: string
}

export interface IDockerService {
  startLabEnvironment(lab: Lab, sessionId: string): Promise<EnvironmentHandle>
  stopLabEnvironment(sessionId: string): Promise<void>
  startTPEnvironment(sessionId: string, kaliImage: string, targets: DockerTarget[]): Promise<EnvironmentHandle>
  stopTPEnvironment(sessionId: string): Promise<void>
  countActiveTPSessions(): Promise<number>
}

type SessionKind = 'lab' | 'tp'

interface CachedSession extends EnvironmentHandle {
  startedAt: string
}

const SESSION_CACHE: Record<SessionKind, { key: (sessionId: string) => string; ttl: number }> = {
  lab: { key: CACHE_KEYS.labSession, ttl: CACHE_TTL.labSession },
  tp: { key: CACHE_KEYS.tpSession, ttl: CACHE_TTL.tpSession },
}

function networkName(sessionId: string): string {
  return `cl-${sessionId}`
}

// Labs reference public images (Kali, Metasploitable, etc.) that are never guaranteed to already
// be on the host — a fresh machine, or a newly added lab, would otherwise fail every single time
// with a cryptic "No such image" 404 instead of just fetching what it needs.
async function ensureImage(docker: Docker, image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect()
    return
  } catch {
    // not present locally — fall through to pull
  }

  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err)
      docker.modem.followProgress(stream, (err2: Error | null) => (err2 ? reject(err2) : resolve()))
    })
  })
}

// Every lab/TP's hints, flags and step commands hardcode a literal target IP like 10.10.0.10 —
// for that to ever actually be reachable, the session's Docker network has to really use that
// subnet, and the target container has to be given that exact address. A single shared subnet
// can't be reused across concurrent sessions though (confirmed against the Docker daemon: creating
// a second bridge network with a subnet already in use by another network fails with "Pool
// overlaps"), so this is a small pool of candidate /24s — comfortably more than
// LAB_MAX_CONCURRENT_SESSIONS on each of the Lab and TP counters combined — tried in order until
// one isn't already taken by another live session.
const SUBNET_POOL = Array.from({ length: 10 }, (_, i) => `10.10.${i}.0/24`)

function subnetPrefix(cidr: string): string {
  return cidr.split('/')[0].split('.').slice(0, 3).join('.')
}

// Reuses whatever last octet a target/flag/step already hardcodes (e.g. the `.10` in `10.10.0.10`,
// or the `.20` a second target in a multi-target lab like net-002 uses) against whichever subnet
// this session actually landed on, so the container ends up at exactly the address the content
// already tells the user to attack.
function staticIpFor(prefix: string, declaredIp: string): string {
  return `${prefix}.${declaredIp.split('.').pop()}`
}

async function createSessionNetwork(docker: Docker, sessionId: string): Promise<{ network: Docker.Network; prefix: string }> {
  let lastErr: unknown
  for (const cidr of SUBNET_POOL) {
    try {
      const prefix = subnetPrefix(cidr)
      const network = await docker.createNetwork({
        Name: networkName(sessionId),
        Driver: 'bridge',
        IPAM: { Config: [{ Subnet: cidr, Gateway: `${prefix}.1` }] },
      })
      return { network, prefix }
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('No free lab subnet available')
}

export class DockerLabService implements IDockerService {
  private get docker(): Docker {
    return getDockerClient()
  }

  startLabEnvironment(lab: Lab, sessionId: string): Promise<EnvironmentHandle> {
    return this.startEnvironment('lab', sessionId, lab.kaliImage, lab.targets)
  }

  stopLabEnvironment(sessionId: string): Promise<void> {
    return this.stopEnvironment('lab', sessionId)
  }

  startTPEnvironment(sessionId: string, kaliImage: string, targets: DockerTarget[]): Promise<EnvironmentHandle> {
    return this.startEnvironment('tp', sessionId, kaliImage, targets)
  }

  stopTPEnvironment(sessionId: string): Promise<void> {
    return this.stopEnvironment('tp', sessionId)
  }

  async countActiveTPSessions(): Promise<number> {
    return (await cacheService.get<number>(CACHE_KEYS.tpActiveSessions)) ?? 0
  }

  private async startEnvironment(
    kind: SessionKind,
    sessionId: string,
    kaliImage: string,
    targets: DockerTarget[]
  ): Promise<EnvironmentHandle> {
    const docker = this.docker
    const { network, prefix } = await createSessionNetwork(docker, sessionId)
    const netName = networkName(sessionId)

    try {
      await ensureImage(docker, kaliImage)

      const kali = await docker.createContainer({
        Image: kaliImage,
        name: `kali-${sessionId}`,
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        HostConfig: {
          NetworkMode: netName,
          CapAdd: ['NET_ADMIN', 'NET_RAW'],
          Memory: 512 * 1024 * 1024,
          NanoCpus: 500_000_000,
          Ulimits: [{ Name: 'nofile', Soft: 1024, Hard: 2048 }],
        },
      })
      await kali.start()

      for (const target of targets) {
        await ensureImage(docker, target.image)
        const ctn = await docker.createContainer({
          Image: target.image,
          name: `${target.name}-${sessionId}`,
          Hostname: target.hostname ?? target.name,
          HostConfig: { NetworkMode: netName },
          NetworkingConfig: {
            EndpointsConfig: {
              [netName]: { IPAMConfig: { IPv4Address: staticIpFor(prefix, target.ip) } },
            },
          },
        })
        await ctn.start()
      }

      const handle: EnvironmentHandle = { kaliId: kali.id, networkId: network.id }
      const cache = SESSION_CACHE[kind]
      await cacheService.set<CachedSession>(
        cache.key(sessionId),
        { ...handle, startedAt: new Date().toISOString() },
        cache.ttl
      )
      sessions.set(sessionId, { kaliId: kali.id })

      if (kind === 'tp') {
        // stopEnvironment only decrements when the matching session key is still around (see its
        // comment) — a session abandoned past its own TTL (crash, closed tab, never explicitly
        // stopped) would otherwise leave this counter incremented forever. Refreshing its TTL here
        // bounds that drift to one session-timeout window instead of letting it accumulate forever:
        // once nobody starts a new TP session for that long, the whole counter key just expires away.
        await cacheService.incr(CACHE_KEYS.tpActiveSessions)
        await cacheService.expire(CACHE_KEYS.tpActiveSessions, CACHE_TTL.tpSession)
      }

      return handle
    } catch (err) {
      // Don't leak the network (or a partially started container) when any step above fails —
      // otherwise every failed attempt (missing image, OOM, etc.) piles up orphaned Docker
      // resources that the user has to clean up by hand.
      await this.stopEnvironment(kind, sessionId).catch(() => {})
      await network.remove().catch(() => {})
      throw err
    }
  }

  private async stopEnvironment(kind: SessionKind, sessionId: string): Promise<void> {
    const docker = this.docker
    const cacheKey = SESSION_CACHE[kind].key(sessionId)
    const cached = await cacheService.get<CachedSession>(cacheKey)

    const containers = await docker.listContainers({ all: true, filters: { name: [sessionId] } })

    await Promise.allSettled(
      containers.map(async (c) => {
        const ctn = docker.getContainer(c.Id)
        if (c.State === 'running') await ctn.stop({ t: 5 }).catch(() => {})
        await ctn.remove({ force: true }).catch(() => {})
      })
    )

    if (cached?.networkId) {
      await docker.getNetwork(cached.networkId).remove().catch(() => {})
    }

    // Guarded on `cached`: startEnvironment sets the session key before incrementing the counter,
    // so if this is a cleanup call for a session that failed before that increment ever ran (see the
    // catch block above), `cached` is null and there is nothing to give back.
    if (kind === 'tp' && cached) await cacheService.decr(CACHE_KEYS.tpActiveSessions)

    await cacheService.del(cacheKey)
    sessions.delete(sessionId)
  }
}

export const dockerLabService: IDockerService = new DockerLabService()
