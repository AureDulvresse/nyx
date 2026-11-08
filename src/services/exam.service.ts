import { isSameDay } from 'date-fns'
import type { QuizQuestion, ExamAttempt, ExamAttemptResult } from '@/domain'
import { toPercentage } from '@/lib/utils/math.utils'

function correctIndices(question: QuizQuestion): number[] {
  return Array.isArray(question.correct) ? question.correct : [question.correct]
}

function isCorrectAnswer(question: QuizQuestion, chosen: number[]): boolean {
  const correctSet = correctIndices(question)
  // Set equality, order-independent: works identically whether the question has one correct
  // answer or several — no separate branch needed for single- vs multi-select questions.
  return chosen.length === correctSet.length && correctSet.every((c) => chosen.includes(c))
}

export const ExamService = {
  correctIndices,

  isMultiSelect(question: QuizQuestion): boolean {
    return Array.isArray(question.correct) && question.correct.length > 1
  },

  grade(
    questions: QuizQuestion[],
    answers: { questionId: string; chosen: number[] }[],
    durationMs: number,
    passingPercentage: number
  ): ExamAttemptResult {
    const map = new Map(answers.map((a) => [a.questionId, a.chosen]))
    const graded = questions.map((q) => {
      const chosen = map.get(q.id) ?? []
      return {
        questionId: q.id,
        chosen,
        correct: isCorrectAnswer(q, chosen),
      }
    })
    const score = graded.filter((a) => a.correct).length
    const total = questions.length
    const percentage = toPercentage(score, total)

    return {
      score,
      total,
      percentage,
      passed: percentage >= passingPercentage,
      answers: graded,
      duration: Math.round(durationMs / 1000),
    }
  },

  // No same-day retake after a pass — enforced server-side so a direct action call can't bypass
  // the UI's own check.
  isRetakeBlocked(latestAttempt: Pick<ExamAttempt, 'passed' | 'createdAt'> | null, now = new Date()): boolean {
    return latestAttempt?.passed === true && isSameDay(latestAttempt.createdAt, now)
  },
}
