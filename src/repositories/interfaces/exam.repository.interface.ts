import type { CourseExam, ExamAttempt, ExamAttemptResult, ExamSessionData } from '@/domain'

export interface IExamRepository {
  findByCourse(courseId: string): Promise<CourseExam | null>
  findById(id: string): Promise<CourseExam | null>
  recordAttempt(examId: string, result: ExamAttemptResult): Promise<ExamAttempt>
  findLatestAttempt(examId: string): Promise<ExamAttempt | null>
  /** Stores an in-progress attempt; returns its opaque token. */
  createSession(session: ExamSessionData, ttlSeconds: number): Promise<string>
  /** Reads and deletes an attempt (single use). Null when unknown or expired. */
  consumeSession(token: string): Promise<ExamSessionData | null>
}
