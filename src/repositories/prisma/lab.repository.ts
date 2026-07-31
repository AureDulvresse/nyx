import { prisma } from '@/lib/prisma'
import type { ILabRepository } from '../interfaces'
import type { CompletedLabSession, Lab, LabSession, LabSessionStatus } from '@/domain'

export class PrismaLabRepository implements ILabRepository {
  async findAll(): Promise<Lab[]> {
    const labs = await prisma.lab.findMany({ where: { published: true }, include: { flags: true } })
    return labs as unknown as Lab[]
  }

  async findById(id: string): Promise<Lab | null> {
    return prisma.lab.findUnique({ where: { id }, include: { flags: true } }) as unknown as Promise<Lab | null>
  }

  async findBySlug(slug: string): Promise<Lab | null> {
    return prisma.lab.findUnique({ where: { slug }, include: { flags: true } }) as unknown as Promise<Lab | null>
  }

  async countActiveSessions(): Promise<number> {
    return prisma.labSession.count({ where: { status: 'active' } })
  }

  async countCompletedSessions(): Promise<number> {
    return prisma.labSession.count({ where: { status: 'completed' } })
  }

  async findCompletedSessions(): Promise<CompletedLabSession[]> {
    const sessions = await prisma.labSession.findMany({
      where: { status: 'completed' },
      include: { lab: true },
      orderBy: { completedAt: 'desc' },
    })
    return sessions
      .filter((s) => s.completedAt)
      .map((s) => ({
        id: s.id,
        labId: s.labId,
        labSlug: s.lab.slug,
        labTitle: s.lab.title,
        labCategory: s.lab.category as CompletedLabSession['labCategory'],
        score: s.score,
        bonusPoints: s.bonusPoints,
        startedAt: s.startedAt,
        completedAt: s.completedAt!,
      }))
  }

  async findStaleActiveSessions(olderThan: Date): Promise<LabSession[]> {
    const sessions = await prisma.labSession.findMany({ where: { status: 'active', startedAt: { lt: olderThan } } })
    return sessions as unknown as LabSession[]
  }

  async findSessionsByLabId(labId: string): Promise<LabSession[]> {
    const sessions = await prisma.labSession.findMany({ where: { labId }, orderBy: { startedAt: 'desc' } })
    return sessions as unknown as LabSession[]
  }

  async createSession(id: string, labId: string, kaliId: string, networkId: string): Promise<LabSession> {
    return prisma.labSession.create({
      data: { id, labId, kaliId, networkId, status: 'active' },
    }) as unknown as Promise<LabSession>
  }

  async findSession(sessionId: string): Promise<LabSession | null> {
    return prisma.labSession.findUnique({ where: { id: sessionId } }) as unknown as Promise<LabSession | null>
  }

  async updateSessionStatus(
    sessionId: string,
    status: LabSessionStatus,
    score?: number,
    bonusPoints?: number
  ): Promise<LabSession> {
    return prisma.labSession.update({
      where: { id: sessionId },
      data: {
        status,
        ...(score !== undefined ? { score } : {}),
        ...(bonusPoints !== undefined ? { bonusPoints } : {}),
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      },
    }) as unknown as Promise<LabSession>
  }

  async captureFlag(sessionId: string, flagId: string): Promise<{ alreadyCaptured: boolean }> {
    const existing = await prisma.flagCapture.findUnique({
      where: { flagId_sessionId: { flagId, sessionId } },
    })
    if (existing) return { alreadyCaptured: true }

    await prisma.flagCapture.create({ data: { flagId, sessionId } })
    return { alreadyCaptured: false }
  }
}
