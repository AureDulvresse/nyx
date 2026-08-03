import { prisma } from '@/lib/prisma'
import { cacheService, CACHE_KEYS } from '@/infrastructure/cache'
import type { IExamRepository } from '../interfaces'
import type { CourseExam, ExamAttempt, ExamAttemptResult } from '@/domain'

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

  async hasPassed(examId: string): Promise<boolean> {
    const passedAttempt = await prisma.examAttempt.findFirst({ where: { examId, passed: true } })
    return passedAttempt !== null
  }
}
