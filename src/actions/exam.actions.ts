'use server'

import { z } from 'zod'
import { isSameDay } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { examRepo } from '@/repositories'
import { ExamService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import type { ExamAttemptResult } from '@/domain'
import { SubmitExamSchema } from '@/lib/schemas'

export async function submitExam(input: z.infer<typeof SubmitExamSchema>): Promise<ActionResult<ExamAttemptResult>> {
  const v = SubmitExamSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`exam-submit:${v.data.examId}`, 10, 60)
  if (!allowed) return err('Trop de tentatives, patiente un instant.', 'RATE_LIMIT')

  try {
    const exam = await examRepo.findById(v.data.examId)
    if (!exam) return err('Examen introuvable', 'NOT_FOUND')

    // Server-side enforcement of the "no same-day retake after a pass" cooldown — the UI already
    // blocks this earlier, but a direct action call must not be able to bypass it.
    const latestAttempt = await examRepo.findLatestAttempt(v.data.examId)
    if (latestAttempt?.passed && isSameDay(latestAttempt.createdAt, new Date())) {
      return err('Tu as déjà réussi cet examen aujourd’hui — reviens demain pour le repasser.', 'COOLDOWN')
    }

    const result = ExamService.grade(exam.questions, v.data.answers, v.data.duration * 1000, exam.passingPercentage)
    await examRepo.recordAttempt(v.data.examId, result)
    revalidatePath('/courses')
    return ok(result)
  } catch {
    return err('Failed to submit exam', 'DB_ERROR')
  }
}
