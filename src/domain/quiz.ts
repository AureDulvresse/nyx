export interface QuizQuestion {
  id: string
  question: string
  options: [string, string, string, string]
  // A plain number for single-answer questions (the vast majority — chapter quizzes only ever
  // author these). An array of 2+ indices marks a multi-select question — exam-only for now,
  // since the chapter quiz UI (QuestionCard) is a single-select radio picker by design.
  correct: 0 | 1 | 2 | 3 | number[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

export interface QuizAttemptResult {
  score: number
  total: number
  percentage: number
  passed: boolean
  answers: { questionId: string; chosen: number; correct: boolean }[]
  duration: number
}

export interface Quiz {
  id: string
  chapterId: string
  title: string
  questions: QuizQuestion[]
  createdAt: Date
}

export interface QuizAttempt {
  id: string
  quizId: string
  score: number
  total: number
  answers: QuizAttemptResult['answers']
  duration: number | null
  createdAt: Date
}

export interface QuizAttemptWithContext {
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  courseSlug: string
  courseTitle: string
  score: number
  total: number
  createdAt: Date
}

export interface WeakChapter {
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  courseSlug: string
  courseTitle: string
  lastPercentage: number
  averagePercentage: number
  attemptCount: number
}
