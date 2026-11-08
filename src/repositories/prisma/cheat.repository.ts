import { prisma } from '@/lib/prisma'
import type { ICheatRepository } from '../interfaces'
import type { CheatEntry } from '@/domain'

export class PrismaCheatRepository implements ICheatRepository {
  async search(query?: string, category?: string): Promise<CheatEntry[]> {
    const entries = await prisma.cheatEntry.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { command: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { title: 'asc' },
    })
    return entries as unknown as CheatEntry[]
  }

  async listCategories(): Promise<string[]> {
    const rows = await prisma.cheatEntry.findMany({ distinct: ['category'], select: { category: true } })
    return rows.map((r) => r.category)
  }

  async toggleFavorite(id: string): Promise<CheatEntry> {
    const entry = await prisma.cheatEntry.findUniqueOrThrow({ where: { id } })
    const updated = await prisma.cheatEntry.update({ where: { id }, data: { isFavorite: !entry.isFavorite } })
    return updated as unknown as CheatEntry
  }
}
