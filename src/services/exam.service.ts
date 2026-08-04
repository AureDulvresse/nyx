import { QuizQuestion, ExamAttemptResult } from '@/domain'

function isCorrectAnswer(question: QuizQuestion, chosen: number[]): boolean {
  const correctSet = Array.isArray(question.correct) ? question.correct : [question.correct]
  // Set equality, order-independent: works identically whether the question has one correct
  // answer or several — no separate branch needed for single- vs multi-select questions.
  return chosen.length === correctSet.length && correctSet.every((c) => chosen.includes(c))
}

export const ExamService = {
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
