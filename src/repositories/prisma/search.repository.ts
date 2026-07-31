import { prisma } from '@/lib/prisma'
import type { ISearchRepository } from '../interfaces'
import type { SearchResultItem } from '@/domain'

const PER_CATEGORY_LIMIT = 6

export class PrismaSearchRepository implements ISearchRepository {
  async search(query: string): Promise<SearchResultItem[]> {
    const q = query.trim()
    if (q.length < 2) return []

    const [courses, chapters, cheatEntries, labs] = await Promise.all([
      prisma.course.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        take: PER_CATEGORY_LIMIT,
        orderBy: { order: 'asc' },
      }),
      prisma.chapter.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        take: PER_CATEGORY_LIMIT,
        include: { course: true },
        orderBy: { number: 'asc' },
      }),
      prisma.cheatEntry.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { command: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: PER_CATEGORY_LIMIT,
        orderBy: { title: 'asc' },
      }),
      prisma.lab.findMany({
        where: { published: true, title: { contains: q, mode: 'insensitive' } },
        take: PER_CATEGORY_LIMIT,
        orderBy: { title: 'asc' },
      }),
    ])

    const results: SearchResultItem[] = [
      ...courses.map((c) => ({ type: 'course' as const, title: c.title, subtitle: c.category, href: `/courses/${c.slug}` })),
      ...chapters.map((c) => ({
        type: 'chapter' as const,
        title: c.title,
        subtitle: c.course.title,
        href: `/courses/${c.course.slug}/${c.number}`,
      })),
      ...cheatEntries.map((c) => ({ type: 'cheat' as const, title: c.title, subtitle: c.command, href: `/cheatsheet` })),
      ...labs.map((l) => ({ type: 'lab' as const, title: l.title, subtitle: l.category, href: `/labs/${l.id}` })),
    ]

    return results
  }
}
