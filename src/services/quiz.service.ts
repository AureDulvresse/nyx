import type { QuizQuestion, QuizAttemptResult } from '@/domain'
import { QUIZ_PASS_RATIO } from '@/lib/constants'
import { toPercentage } from '@/lib/utils/math.utils'

export const QuizService = {
  grade(
    questions: QuizQuestion[],
    answers: { questionId: string; chosen: number }[],
    durationMs: number
  ): QuizAttemptResult {
    const map = new Map(answers.map((a) => [a.questionId, a.chosen]))
    const graded = questions.map((q) => ({
      questionId: q.id,
      chosen: map.get(q.id) ?? -1,
      correct: map.get(q.id) === q.correct,
    }))
    const score = graded.filter((a) => a.correct).length
    const total = questions.length
    return {
      score,
      total,
      percentage: toPercentage(score, total),
      passed: total > 0 && score / total >= QUIZ_PASS_RATIO,
      answers: graded,
      duration: Math.round(durationMs / 1000),
    }
  },

  shuffle: <T>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  },
}
