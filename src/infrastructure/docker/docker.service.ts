import type Docker from 'dockerode'
import { Lab } from '@/domain'
import { sessions } from './sessions.store'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'
import { getDockerClient } from './docker.client'

export interface IDockerService {
  startLabEnvironment(lab: Lab, sessionId: string): Promise<{ kaliId: string; networkId: string }>
  stopLabEnvironment(sessionId: string): Promise<void>
  isSessionRunning(sessionId: string): Promise<boolean>
  startTPEnvironment(sessionId: string, kaliImage: string): Promise<{ kaliId: string; networkId: string }>
  stopTPEnvironment(sessionId: string): Promise<void>
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

export class DockerLabService implements IDockerService {
  private get docker() {
    return getDockerClient()
  }

  async startLabEnvironment(lab: Lab, sessionId: string) {
    const docker = this.docker

    // No explicit IPAM subnet here: every lab session gets its own bridge network, and up to
    // LAB_MAX_CONCURRENT_SESSIONS can run at once. A fixed subnet would collide across concurrent
    // sessions (or with a leftover network Redis/DB lost track of) with a 403 "Pool overlaps"
    // error from the Docker daemon. Letting Docker auto-allocate from its address pool avoids that.
    const network = await docker.createNetwork({
      Name: `cl-${sessionId}`,
      Driver: 'bridge',
    })

    try {
      await ensureImage(docker, lab.kaliImage)

      const kali = await docker.createContainer({
        Image: lab.kaliImage,
        name: `kali-${sessionId}`,
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        HostConfig: {
          NetworkMode: `cl-${sessionId}`,
          CapAdd: ['NET_ADMIN', 'NET_RAW'],
          Memory: 512 * 1024 * 1024,
          NanoCpus: 500_000_000,
          Ulimits: [{ Name: 'nofile', Soft: 1024, Hard: 2048 }],
        },
      })
      await kali.start()

      for (const target of lab.targets) {
        await ensureImage(docker, target.image)
        const ctn = await docker.createContainer({
          Image: target.image,
          name: `${target.name}-${sessionId}`,
          Hostname: target.hostname ?? target.name,
          HostConfig: { NetworkMode: `cl-${sessionId}` },
        })
        await ctn.start()
      }

      await cacheService.set(
        CACHE_KEYS.labSession(sessionId),
        { kaliId: kali.id, networkId: network.id, startedAt: new Date().toISOString() },
        CACHE_TTL.labSession
      )
      sessions.set(sessionId, { kaliId: kali.id })
      await cacheService.incr(CACHE_KEYS.labActiveSessions)

      return { kaliId: kali.id, networkId: network.id }
    } catch (err) {
      // Don't leak the network (or a partially started container) when any step above fails —
      // otherwise every failed attempt (missing image, OOM, etc.) piles up orphaned Docker
      // resources that the user has to clean up by hand.
      await this.stopLabEnvironment(sessionId).catch(() => {})
      await network.remove().catch(() => {})
      throw err
    }
  }

  async stopLabEnvironment(sessionId: string) {
    const docker = this.docker
    const cached = await cacheService.get<{ kaliId: string; networkId: string }>(CACHE_KEYS.labSession(sessionId))

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

    await cacheService.del(CACHE_KEYS.labSession(sessionId))
    sessions.delete(sessionId)
  }

  async isSessionRunning(sessionId: string): Promise<boolean> {
    return cacheService.exists(CACHE_KEYS.labSession(sessionId))
  }

  async startTPEnvironment(sessionId: string, kaliImage: string) {
    const docker = this.docker

    const network = await docker.createNetwork({ Name: `cl-${sessionId}`, Driver: 'bridge' })

    try {
      await ensureImage(docker, kaliImage)

      const kali = await docker.createContainer({
        Image: kaliImage,
        name: `kali-${sessionId}`,
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        HostConfig: {
          NetworkMode: `cl-${sessionId}`,
          CapAdd: ['NET_ADMIN', 'NET_RAW'],
          Memory: 512 * 1024 * 1024,
          NanoCpus: 500_000_000,
          Ulimits: [{ Name: 'nofile', Soft: 1024, Hard: 2048 }],
        },
      })
      await kali.start()

      await cacheService.set(
        CACHE_KEYS.tpSession(sessionId),
        { kaliId: kali.id, networkId: network.id, startedAt: new Date().toISOString() },
        CACHE_TTL.tpSession
      )
      sessions.set(sessionId, { kaliId: kali.id })
      await cacheService.incr(CACHE_KEYS.tpActiveSessions)

      return { kaliId: kali.id, networkId: network.id }
    } catch (err) {
      await this.stopTPEnvironment(sessionId).catch(() => {})
      await network.remove().catch(() => {})
      throw err
    }
  }

  async stopTPEnvironment(sessionId: string) {
    const docker = this.docker
    const cached = await cacheService.get<{ kaliId: string; networkId: string }>(CACHE_KEYS.tpSession(sessionId))

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

    await cacheService.del(CACHE_KEYS.tpSession(sessionId))
    sessions.delete(sessionId)
  }
}

export const dockerLabService: IDockerService = new DockerLabService()
