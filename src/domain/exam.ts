import type { QuizQuestion } from './quiz'

export interface CourseExam {
  id: string
  courseId: string
  title: string
  questions: QuizQuestion[]
  passingPercentage: number
  createdAt: Date
}

/** Exam metadata safe to send to the browser (no question bank, no answers). */
export interface CourseExamSummary {
  id: string
  title: string
  passingPercentage: number
  bankSize: number
  questionCount: number
  durationSeconds: number
}

/** A question as presented during an attempt: options already shuffled, answers withheld. */
export interface ExamQuestionPublic {
  id: string
  question: string
  options: [string, string, string, string]
  multiSelect: boolean
  tags: string[]
}

/** Server-side record of one attempt: which questions were drawn and how options were shuffled. */
export interface ExamSessionData {
  examId: string
  questionIds: string[]
  /** For each question, optionOrder[presentedIndex] = original index in the bank. */
  optionOrders: Record<string, number[]>
  startedAt: string
  durationSeconds: number
}

export interface ExamPaper {
  token: string
  questions: ExamQuestionPublic[]
  durationSeconds: number
}

export interface ExamAttemptResult {
  score: number
  total: number
  percentage: number
  passed: boolean
  // Always an array, even for single-answer questions (a 1-element array) — lets grading use one
  // uniform set-equality check instead of branching between single/multi question types.
  // Indices refer to the ORIGINAL option order of the question bank.
  answers: { questionId: string; chosen: number[]; correct: boolean }[]
  duration: number
}

/** Correction of one question, in the PRESENTED option order of the attempt. */
export interface ExamReviewItem {
  questionId: string
  chosen: number[]
  correctOptions: number[]
  isCorrect: boolean
  explanation: string
}

export interface ExamSubmission {
  score: number
  total: number
  percentage: number
  passed: boolean
  duration: number
  /** Tags of wrongly answered questions with their count, most frequent first. */
  weakTags: { tag: string; count: number }[]
  /** Full per-question correction — only for a passed attempt (no free answer key on failure). */
  review: ExamReviewItem[] | null
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
