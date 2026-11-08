'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { examRepo } from '@/repositories'
import { ExamService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import type { ExamAttemptResult } from '@/domain'
import { SubmitExamSchema } from '@/lib/schemas'

export async function submitExam(input: z.infer<typeof SubmitExamSchema>): Promise<ActionResult<ExamAttemptResult>> {
  const v = SubmitExamSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`exam-submit:${v.data.examId}`, 10, 60)
  if (!allowed) return err('Trop de tentatives, patiente un instant.', 'RATE_LIMIT')

  return runAction(
    async () => {
      const exam = await examRepo.findById(v.data.examId)
      if (!exam) return err('Examen introuvable', 'NOT_FOUND')

      const latestAttempt = await examRepo.findLatestAttempt(v.data.examId)
      if (ExamService.isRetakeBlocked(latestAttempt)) {
        return err('Tu as déjà réussi cet examen aujourd’hui — reviens demain pour le repasser.', 'COOLDOWN')
      }

      const result = ExamService.grade(exam.questions, v.data.answers, v.data.duration * 1000, exam.passingPercentage)
      await examRepo.recordAttempt(v.data.examId, result)
      revalidatePath('/courses')
      return ok(result)
    },
    { message: 'Failed to submit exam', code: 'DB_ERROR' }
  )
}
