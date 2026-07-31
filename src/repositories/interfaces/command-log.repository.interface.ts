import type { CommandLogEntry } from '@/domain'

export interface ICommandLogRepository {
  create(sessionId: string, command: string): Promise<CommandLogEntry>
  findBySession(sessionId: string): Promise<CommandLogEntry[]>
}
