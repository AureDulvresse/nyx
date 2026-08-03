import type { ILabRepository } from '@/repositories'
import type { IDockerService } from '@/infrastructure/docker/docker.service'
import type { FlagSubmitResult, HintUnlockResult, LabSession } from '@/domain'

const MAX_CONCURRENT_SESSIONS = parseInt(process.env.LAB_MAX_CONCURRENT_SESSIONS ?? '3', 10)
const SESSION_TIMEOUT_HOURS = parseInt(process.env.LAB_SESSION_TIMEOUT_HOURS ?? '2', 10)
// Deducted once per flag the first time its hint is unlocked — steep enough that solving without
// help still matters for the score, light enough that a genuinely stuck user isn't punished out
// of finishing the lab.
const HINT_PENALTY_RATIO = 0.15

export class LabService {
  constructor(
    private labRepo: ILabRepository,
    private dockerService: IDockerService
  ) {}

  private async reapStaleSessions(): Promise<void> {
    const cutoff = new Date(Date.now() - SESSION_TIMEOUT_HOURS * 3600 * 1000)
    const stale = await this.labRepo.findStaleActiveSessions(cutoff)
    await Promise.allSettled(
      stale.map(async (session) => {
        await this.dockerService.stopLabEnvironment(session.id)
        await this.labRepo.updateSessionStatus(session.id, 'expired')
      })
    )
  }

  async startSession(labId: string, userId: string): Promise<LabSession> {
    // A session whose Docker containers were torn down without going through stopSession (browser
    // closed, process killed, host rebooted) stays "active" in the DB forever otherwise, silently
    // eating one of the few concurrent slots until nobody can start a lab at all.
    await this.reapStaleSessions()

    const activeCount = await this.labRepo.countActiveSessions()
    if (activeCount >= MAX_CONCURRENT_SESSIONS) {
      throw new Error(`Maximum ${MAX_CONCURRENT_SESSIONS} sessions concurrentes atteint`)
    }

    const lab = await this.labRepo.findById(labId)
    if (!lab || !lab.published) throw new Error('Lab introuvable ou non publié')

    const sessionId = crypto.randomUUID()
    const { kaliId, networkId } = await this.dockerService.startLabEnvironment(lab, sessionId)

    return this.labRepo.createSession(sessionId, labId, kaliId, networkId)
  }

  async submitFlag(sessionId: string, flagValue: string, activeElapsedSeconds?: number): Promise<FlagSubmitResult> {
    const session = await this.labRepo.findSession(sessionId)
    if (!session || session.status !== 'active') return { success: false }

    const lab = await this.labRepo.findById(session.labId)
    const flag = lab?.flags?.find((f) => f.value === flagValue)
    if (!flag) return { success: false }

    const { alreadyCaptured } = await this.labRepo.captureFlag(sessionId, flag.id)
    if (alreadyCaptured) return { success: false }

    const newScore = session.score + flag.points
    const totalPoints = lab?.totalPoints ?? 0
    const labCompleted = newScore >= totalPoints

    // Bonus for finishing under the estimated time — up to 20% of the lab's total points,
    // tapering linearly to 0 as the active time (terminal provisioning excluded) approaches the
    // estimate, and 0 beyond it. Only computed on the flag that actually completes the lab.
    let bonusPoints = 0
    if (labCompleted && lab && activeElapsedSeconds !== undefined) {
      const estimatedSeconds = lab.estimatedTime * 60
      if (activeElapsedSeconds < estimatedSeconds) {
        bonusPoints = Math.round(lab.totalPoints * 0.2 * (1 - activeElapsedSeconds / estimatedSeconds))
      }
    }

    await this.labRepo.updateSessionStatus(sessionId, labCompleted ? 'completed' : 'active', newScore, bonusPoints)
    if (labCompleted) await this.dockerService.stopLabEnvironment(sessionId)

    return {
      success: true,
      flagId: flag.flagId,
      points: flag.points,
      labCompleted,
      totalScore: newScore + bonusPoints,
      bonusPoints: labCompleted ? bonusPoints : undefined,
    }
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.dockerService.stopLabEnvironment(sessionId)
    await this.labRepo.updateSessionStatus(sessionId, 'expired')
  }

  async unlockHint(sessionId: string, flagId: string): Promise<HintUnlockResult> {
    const session = await this.labRepo.findSession(sessionId)
    if (!session || session.status !== 'active') throw new Error('Session introuvable ou inactive')

    const lab = await this.labRepo.findById(session.labId)
    const flag = lab?.flags?.find((f) => f.id === flagId)
    if (!flag) throw new Error('Flag introuvable')

    const { alreadyUnlocked } = await this.labRepo.unlockHintRecord(sessionId, flagId)

    let penalty = 0
    if (!alreadyUnlocked) {
      penalty = Math.round(flag.points * HINT_PENALTY_RATIO)
      if (penalty > 0) {
        await this.labRepo.updateSessionStatus(sessionId, 'active', Math.max(0, session.score - penalty))
      }
    }

    return { hint: flag.hint, penalty, alreadyUnlocked }
  }
}
