'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { examRepo } from '@/repositories'
import { ExamService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import type { ExamPaper, ExamSubmission } from '@/domain'
import { StartExamSchema, SubmitExamSchema } from '@/lib/schemas'

const COOLDOWN_MESSAGE = 'Tu as déjà réussi cet examen aujourd’hui — reviens demain pour le repasser.'

// Draws the questions server-side: the browser only ever receives shuffled options without answers.
export async function startExam(input: z.infer<typeof StartExamSchema>): Promise<ActionResult<ExamPaper>> {
  const v = StartExamSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`exam-start:${v.data.examId}`, 10, 60)
  if (!allowed) return err('Trop de tentatives, patiente un instant.', 'RATE_LIMIT')

  return runAction(
    async () => {
      const exam = await examRepo.findById(v.data.examId)
      if (!exam) return err('Examen introuvable', 'NOT_FOUND')
      if (ExamService.isRetakeBlocked(await examRepo.findLatestAttempt(exam.id))) return err(COOLDOWN_MESSAGE, 'COOLDOWN')

      const session = ExamService.drawSession(exam)
      const token = await examRepo.createSession(session, ExamService.sessionTtlSeconds(session))
      return ok({ token, questions: ExamService.toPublicQuestions(exam, session), durationSeconds: session.durationSeconds })
    },
    { message: 'Impossible de démarrer l’examen.', code: 'DB_ERROR' }
  )
}

export async function submitExam(input: z.infer<typeof SubmitExamSchema>): Promise<ActionResult<ExamSubmission>> {
  const v = SubmitExamSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const session = await examRepo.consumeSession(v.data.token)
      if (!session) return err('Session d’examen expirée ou déjà soumise — relance l’examen.', 'EXPIRED')

      const exam = await examRepo.findById(session.examId)
      if (!exam) return err('Examen introuvable', 'NOT_FOUND')

      const { result, submission } = ExamService.grade(exam, session, v.data.answers, exam.passingPercentage)
      await examRepo.recordAttempt(exam.id, result)
      revalidatePath('/courses', 'layout')
      return ok(submission)
    },
    { message: 'Échec de l’envoi de l’examen.', code: 'DB_ERROR' }
  )
}
