import type { CompletedLabSession, Lab, LabSession, LabSessionStatus } from '@/domain'

export interface ILabRepository {
  findAll(): Promise<Lab[]>
  findById(id: string): Promise<Lab | null>
  findBySlug(slug: string): Promise<Lab | null>
  countActiveSessions(): Promise<number>
  countCompletedSessions(): Promise<number>
  findCompletedSessions(): Promise<CompletedLabSession[]>
  findStaleActiveSessions(olderThan: Date): Promise<LabSession[]>
  findSessionsByLabId(labId: string): Promise<LabSession[]>
  createSession(id: string, labId: string, kaliId: string, networkId: string): Promise<LabSession>
  findSession(sessionId: string): Promise<LabSession | null>
  updateSessionStatus(sessionId: string, status: LabSessionStatus, score?: number, bonusPoints?: number): Promise<LabSession>
  captureFlag(sessionId: string, flagId: string): Promise<{ alreadyCaptured: boolean }>
  unlockHintRecord(sessionId: string, flagId: string): Promise<{ alreadyUnlocked: boolean }>
}
