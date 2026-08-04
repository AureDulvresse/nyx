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
  // Always an array, even for single-answer questions (a 1-element array) — lets grading use one
  // uniform set-equality check instead of branching between single/multi question types.
  answers: { questionId: string; chosen: number[]; correct: boolean }[]
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
