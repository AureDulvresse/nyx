import { prisma } from '@/lib/prisma'
import type { ITPRepository } from '../interfaces'
import type { TP, TPStep } from '@/domain'

export class PrismaTPRepository implements ITPRepository {
  async findById(id: string): Promise<TP | null> {
    return prisma.tP.findUnique({ where: { id } }) as unknown as Promise<TP | null>
  }

  async findByChapter(chapterId: string): Promise<TP | null> {
    return prisma.tP.findUnique({ where: { chapterId } }) as unknown as Promise<TP | null>
  }

  async findAll(): Promise<TP[]> {
    return prisma.tP.findMany() as unknown as Promise<TP[]>
  }

  async updateNotes(id: string, notes: string): Promise<TP> {
    return prisma.tP.update({ where: { id }, data: { notes } }) as unknown as Promise<TP>
  }

  async updateSteps(id: string, steps: TPStep[]): Promise<TP> {
    return prisma.tP.update({ where: { id }, data: { steps: steps as object } }) as unknown as Promise<TP>
  }

  async complete(id: string): Promise<TP> {
    return prisma.tP.update({ where: { id }, data: { completedAt: new Date() } }) as unknown as Promise<TP>
  }
}
