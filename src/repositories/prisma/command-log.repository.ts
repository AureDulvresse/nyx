import { prisma } from '@/lib/prisma'
import type { ICommandLogRepository } from '../interfaces'
import type { CommandLogEntry } from '@/domain'

export class PrismaCommandLogRepository implements ICommandLogRepository {
  async create(sessionId: string, command: string): Promise<CommandLogEntry> {
    return prisma.commandLogEntry.create({ data: { sessionId, command } })
  }

  async findBySession(sessionId: string): Promise<CommandLogEntry[]> {
    return prisma.commandLogEntry.findMany({ where: { sessionId }, orderBy: { executedAt: 'asc' } })
  }
}
