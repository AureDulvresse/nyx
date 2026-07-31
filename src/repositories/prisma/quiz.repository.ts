import { prisma } from '@/lib/prisma'
import type { IQuizRepository } from '../interfaces'
import type { Quiz, QuizAttempt, QuizAttemptResult, QuizAttemptWithContext } from '@/domain'

export class PrismaQuizRepository implements IQuizRepository {
  async findByChapter(chapterId: string): Promise<Quiz | null> {
    return prisma.quiz.findUnique({ where: { chapterId } }) as unknown as Promise<Quiz | null>
  }

  async findById(id: string): Promise<Quiz | null> {
    return prisma.quiz.findUnique({ where: { id } }) as unknown as Promise<Quiz | null>
  }

  async recordAttempt(quizId: string, result: QuizAttemptResult): Promise<QuizAttempt> {
    return prisma.quizAttempt.create({
      data: {
        quizId,
        score: result.score,
        total: result.total,
        answers: result.answers,
        duration: result.duration,
      },
    }) as unknown as Promise<QuizAttempt>
  }

  async getRecentAttempts(limit: number): Promise<QuizAttempt[]> {
    return prisma.quizAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    }) as unknown as Promise<QuizAttempt[]>
  }

  async getAttemptsWithChapterContext(): Promise<QuizAttemptWithContext[]> {
    const attempts = await prisma.quizAttempt.findMany({
      orderBy: { createdAt: 'asc' },
      include: { quiz: { include: { chapter: { include: { course: true } } } } },
    })
    return attempts.map((a) => ({
      chapterId: a.quiz.chapter.id,
      chapterNumber: a.quiz.chapter.number,
      chapterTitle: a.quiz.chapter.title,
      courseSlug: a.quiz.chapter.course.slug,
      courseTitle: a.quiz.chapter.course.title,
      score: a.score,
      total: a.total,
      createdAt: a.createdAt,
    }))
  }
}
