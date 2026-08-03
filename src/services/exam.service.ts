import { QuizQuestion, ExamAttemptResult } from '@/domain'

export const ExamService = {
  grade(
    questions: QuizQuestion[],
    answers: { questionId: string; chosen: number }[],
    durationMs: number,
    passingPercentage: number
  ): ExamAttemptResult {
    const map = new Map(answers.map((a) => [a.questionId, a.chosen]))
    const graded = questions.map((q) => ({
      questionId: q.id,
      chosen: map.get(q.id) ?? -1,
      correct: map.get(q.id) === q.correct,
    }))
    const score = graded.filter((a) => a.correct).length
    const total = questions.length
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0

    return {
      score,
      total,
      percentage,
      passed: percentage >= passingPercentage,
      answers: graded,
      duration: Math.round(durationMs / 1000),
    }
  },
}
