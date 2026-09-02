import type { ITPRepository } from '@/repositories'
import type { IDockerService } from '@/infrastructure/docker/docker.service'
import { cacheService, CACHE_KEYS } from '@/infrastructure/cache'

const MAX_CONCURRENT_SESSIONS = parseInt(process.env.LAB_MAX_CONCURRENT_SESSIONS ?? '3', 10)
const DEFAULT_TP_IMAGE = 'nyx/kali-tools'

export class TPService {
  constructor(
    private tpRepo: ITPRepository,
    private dockerService: IDockerService
  ) {}

  async startSession(tpId: string): Promise<{ sessionId: string }> {
    const tp = await this.tpRepo.findById(tpId)
    if (!tp) throw new Error('TP introuvable')

    const activeCount = (await cacheService.get<number>(CACHE_KEYS.tpActiveSessions)) ?? 0
    if (activeCount >= MAX_CONCURRENT_SESSIONS) {
      throw new Error(`Maximum ${MAX_CONCURRENT_SESSIONS} sessions concurrentes atteint`)
    }

    const sessionId = crypto.randomUUID()
    await this.dockerService.startTPEnvironment(sessionId, DEFAULT_TP_IMAGE, tp.targets)
    return { sessionId }
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.dockerService.stopTPEnvironment(sessionId)
  }
}
