import type { Quiz, QuizAttempt, QuizAttemptResult, QuizAttemptWithContext } from '@/domain'

export interface IQuizRepository {
  findByChapter(chapterId: string): Promise<Quiz | null>
  findById(id: string): Promise<Quiz | null>
  recordAttempt(quizId: string, result: QuizAttemptResult): Promise<QuizAttempt>
  getRecentAttempts(limit: number): Promise<QuizAttempt[]>
  getAttemptsWithChapterContext(): Promise<QuizAttemptWithContext[]>
}
