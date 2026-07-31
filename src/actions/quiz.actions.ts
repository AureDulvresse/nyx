'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { quizRepo } from '@/repositories'
import { QuizService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { QuizAttemptResult } from '@/domain'
import { SubmitQuizSchema } from '@/lib/schemas'

export async function submitQuiz(input: z.infer<typeof SubmitQuizSchema>): Promise<ActionResult<QuizAttemptResult>> {
  const v = SubmitQuizSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const quiz = await quizRepo.findById(v.data.quizId)
    if (!quiz) return err('Quiz introuvable', 'NOT_FOUND')

    const result = QuizService.grade(quiz.questions, v.data.answers, v.data.duration * 1000)
    await quizRepo.recordAttempt(v.data.quizId, result)
    revalidatePath('/')
    return ok(result)
  } catch {
    return err('Failed to submit quiz', 'DB_ERROR')
  }
}
