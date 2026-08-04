import type { CourseExam, ExamAttempt, ExamAttemptResult } from '@/domain'

export interface IExamRepository {
  findByCourse(courseId: string): Promise<CourseExam | null>
  findById(id: string): Promise<CourseExam | null>
  recordAttempt(examId: string, result: ExamAttemptResult): Promise<ExamAttempt>
  hasPassed(examId: string): Promise<boolean>
  findLatestAttempt(examId: string): Promise<ExamAttempt | null>
}
