import type { QuizQuestion } from './quiz'

export interface CourseExam {
  id: string
  courseId: string
  title: string
  questions: QuizQuestion[]
  passingPercentage: number
  createdAt: Date
}

export interface ExamAttemptResult {
  score: number
  total: number
  percentage: number
  passed: boolean
  answers: { questionId: string; chosen: number; correct: boolean }[]
  duration: number
}

export interface ExamAttempt {
  id: string
  examId: string
  score: number
  total: number
  passed: boolean
  answers: ExamAttemptResult['answers']
  duration: number | null
  createdAt: Date
}
