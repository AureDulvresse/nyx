import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { cacheService, CACHE_KEYS } from '@/infrastructure/cache'
import type { IExamRepository } from '../interfaces'
import type { CourseExam, ExamAttempt, ExamAttemptResult, ExamSessionData } from '@/domain'

export class PrismaExamRepository implements IExamRepository {
  async findByCourse(courseId: string): Promise<CourseExam | null> {
    return prisma.courseExam.findUnique({ where: { courseId } }) as unknown as Promise<CourseExam | null>
  }

  async findById(id: string): Promise<CourseExam | null> {
    return prisma.courseExam.findUnique({ where: { id } }) as unknown as Promise<CourseExam | null>
  }

  async recordAttempt(examId: string, result: ExamAttemptResult): Promise<ExamAttempt> {
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        score: result.score,
        total: result.total,
        passed: result.passed,
        answers: result.answers,
        duration: result.duration,
      },
    })

    // A passing attempt can flip courseCompleted for the cached CourseProgress — invalidate so
    // the course page reflects it on next load instead of showing a stale "exam not passed" state.
    if (result.passed) {
      const exam = await prisma.courseExam.findUnique({ where: { id: examId }, select: { courseId: true } })
      if (exam) await cacheService.del(CACHE_KEYS.courseProgress(exam.courseId))
    }

    return attempt as unknown as ExamAttempt
  }

  async findLatestAttempt(examId: string): Promise<ExamAttempt | null> {
    return prisma.examAttempt.findFirst({
      where: { examId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<ExamAttempt | null>
  }

  async createSession(session: ExamSessionData, ttlSeconds: number): Promise<string> {
    const token = randomUUID()
    await cacheService.set(CACHE_KEYS.examSession(token), session, ttlSeconds)
    return token
  }

  async consumeSession(token: string): Promise<ExamSessionData | null> {
    const key = CACHE_KEYS.examSession(token)
    const session = await cacheService.get<ExamSessionData>(key)
    if (session) await cacheService.del(key)
    return session
  }
}
