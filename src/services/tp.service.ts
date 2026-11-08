import type { ITPRepository } from '@/repositories'
import type { IDockerService } from '@/infrastructure/docker/docker.service'
import type { TP } from '@/domain'
import { labConfig } from '@/config/lab.config'

const DEFAULT_TP_IMAGE = 'nyx/kali-tools'

export class TPService {
  constructor(
    private tpRepo: ITPRepository,
    private dockerService: IDockerService
  ) {}

  async startSession(tpId: string): Promise<{ sessionId: string }> {
    const tp = await this.tpRepo.findById(tpId)
    if (!tp) throw new Error('TP introuvable')

    const { maxConcurrentSessions } = labConfig
    const activeCount = await this.dockerService.countActiveTPSessions()
    if (activeCount >= maxConcurrentSessions) {
      throw new Error(`Maximum ${maxConcurrentSessions} sessions concurrentes atteint`)
    }

    const sessionId = crypto.randomUUID()
    await this.dockerService.startTPEnvironment(sessionId, DEFAULT_TP_IMAGE, tp.targets)
    return { sessionId }
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.dockerService.stopTPEnvironment(sessionId)
  }

  /** Marks one step as (un)completed. Returns null when the TP doesn't exist. */
  async setStepCompleted(tpId: string, stepIndex: number, completed: boolean): Promise<TP | null> {
    const tp = await this.tpRepo.findById(tpId)
    if (!tp) return null

    const steps = tp.steps.map((step, i) => (i === stepIndex ? { ...step, completed } : step))
    return this.tpRepo.updateSteps(tpId, steps)
  }
}
