import { prisma } from '@/lib/prisma'
import type { IStatsRepository, ProgressionCounts } from '../interfaces'
import { QUIZ_PASS_RATIO } from '@/lib/constants'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export class PrismaStatsRepository implements IStatsRepository {
  async getActivityDates(): Promise<Date[]> {
    // Cached as ISO strings (JSON); revive to Date for callers.
    const isoDates = await cacheService.getOrSet(CACHE_KEYS.statsActivityDates, CACHE_TTL.progress, () =>
      this.loadActivityDates().then((dates) => dates.map((d) => d.toISOString()))
    )
    return isoDates.map((d) => new Date(d))
  }

  private async loadActivityDates(): Promise<Date[]> {
    const [chapters, attempts, labSessions, flagCaptures] = await Promise.all([
      prisma.chapter.findMany({ where: { completedAt: { not: null } }, select: { completedAt: true } }),
      prisma.quizAttempt.findMany({ select: { createdAt: true } }),
      prisma.labSession.findMany({ select: { startedAt: true, completedAt: true } }),
      prisma.flagCapture.findMany({ select: { capturedAt: true } }),
    ])

    return [
      ...chapters.map((c) => c.completedAt!),
      ...attempts.map((a) => a.createdAt),
      ...labSessions.map((s) => s.startedAt),
      ...labSessions.filter((s) => s.completedAt).map((s) => s.completedAt!),
      ...flagCaptures.map((f) => f.capturedAt),
    ]
  }

  async getWeeklyChapterCompletions(): Promise<{ day: string; chapters: number }[]> {
    const now = new Date()
    const mondayOffset = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - mondayOffset)
    const nextMonday = new Date(monday)
    nextMonday.setDate(monday.getDate() + 7)

    const chapters = await prisma.chapter.findMany({
      where: { completedAt: { gte: monday, lt: nextMonday } },
      select: { completedAt: true },
    })

    const counts = new Array(7).fill(0)
    for (const c of chapters) {
      if (!c.completedAt) continue
      const dayIndex = Math.floor((c.completedAt.getTime() - monday.getTime()) / 86_400_000)
      if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex]++
    }

    return DAY_LABELS.map((day, i) => ({ day, chapters: counts[i] }))
  }

  async getProgressionCounts(): Promise<ProgressionCounts> {
    return cacheService.getOrSet(CACHE_KEYS.statsProgressionCounts, CACHE_TTL.progress, () => this.loadProgressionCounts())
  }

  private async loadProgressionCounts(): Promise<ProgressionCounts> {
    const [chaptersCompleted, attempts, tpsCompleted, labsCompleted, projectsCompleted] = await Promise.all([
      prisma.chapter.count({ where: { status: 'completed' } }),
      prisma.quizAttempt.findMany({ select: { score: true, total: true } }),
      prisma.tP.count({ where: { completedAt: { not: null } } }),
      prisma.labSession.count({ where: { status: 'completed' } }),
      prisma.project.count({ where: { status: 'completed' } }),
    ])

    const quizzesPassed = attempts.filter((a) => a.total > 0 && a.score / a.total >= QUIZ_PASS_RATIO).length

    return { chaptersCompleted, quizzesPassed, tpsCompleted, labsCompleted, projectsCompleted }
  }

  async getEarnedCredits(): Promise<{ earned: number; total: number }> {
    return cacheService.getOrSet(CACHE_KEYS.statsEarnedCredits, CACHE_TTL.progress, () => this.loadEarnedCredits())
  }

  private async loadEarnedCredits(): Promise<{ earned: number; total: number }> {
    const [courses, chapters] = await Promise.all([
      prisma.course.findMany({ select: { id: true, credits: true } }),
      prisma.chapter.findMany({ select: { courseId: true, status: true } }),
    ])

    const total = courses.reduce((sum, c) => sum + c.credits, 0)

    let earned = 0
    for (const course of courses) {
      const courseChapters = chapters.filter((c) => c.courseId === course.id)
      if (courseChapters.length === 0) continue
      const completed = courseChapters.filter((c) => c.status === 'completed').length
      earned += (course.credits * completed) / courseChapters.length
    }

    return { earned: Math.round(earned * 10) / 10, total }
  }
}
