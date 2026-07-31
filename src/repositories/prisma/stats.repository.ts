import { prisma } from '@/lib/prisma'
import type { IStatsRepository } from '../interfaces'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export class PrismaStatsRepository implements IStatsRepository {
  async getActivityDates(): Promise<Date[]> {
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

  async getProgressionCounts(): Promise<{
    chaptersCompleted: number
    quizzesPassed: number
    tpsCompleted: number
    labsCompleted: number
    projectsCompleted: number
  }> {
    const [chaptersCompleted, attempts, tpsCompleted, labsCompleted, projectsCompleted] = await Promise.all([
      prisma.chapter.count({ where: { status: 'completed' } }),
      prisma.quizAttempt.findMany({ select: { score: true, total: true } }),
      prisma.tP.count({ where: { completedAt: { not: null } } }),
      prisma.labSession.count({ where: { status: 'completed' } }),
      prisma.project.count({ where: { status: 'completed' } }),
    ])

    const quizzesPassed = attempts.filter((a) => a.total > 0 && a.score / a.total >= 0.6).length

    return { chaptersCompleted, quizzesPassed, tpsCompleted, labsCompleted, projectsCompleted }
  }

  async getEarnedCredits(): Promise<{ earned: number; total: number }> {
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

export const statsRepo = new PrismaStatsRepository()
