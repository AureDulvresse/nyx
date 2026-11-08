'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { tpRepo } from '@/repositories'
import { dockerLabService } from '@/infrastructure/docker/docker.service'
import { TPService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { terminalWsUrl } from '@/lib/constants'
import type { TP } from '@/domain'
import {
  UpdateTPNotesSchema,
  CompleteTPSchema,
  StartTPSessionSchema,
  StopTPSessionSchema,
  UpdateTPStepSchema,
} from '@/lib/schemas'

const tpService = new TPService(tpRepo, dockerLabService)

export async function updateTPNotes(input: z.infer<typeof UpdateTPNotesSchema>): Promise<ActionResult<TP>> {
  const v = UpdateTPNotesSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const tp = await tpRepo.updateNotes(v.data.tpId, v.data.notes)
      revalidatePath('/tp')
      return ok(tp)
    },
    { message: 'Failed to update TP notes', code: 'DB_ERROR' }
  )
}

export async function completeTP(input: z.infer<typeof CompleteTPSchema>): Promise<ActionResult<TP>> {
  const v = CompleteTPSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const tp = await tpRepo.complete(v.data.tpId)
      revalidatePath('/tp')
      return ok(tp)
    },
    { message: 'Failed to complete TP', code: 'DB_ERROR' }
  )
}

export async function updateTPStep(input: z.infer<typeof UpdateTPStepSchema>): Promise<ActionResult<TP>> {
  const v = UpdateTPStepSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const updated = await tpService.setStepCompleted(v.data.tpId, v.data.stepIndex, v.data.completed)
      if (!updated) return err('TP introuvable', 'NOT_FOUND')
      revalidatePath('/tp')
      return ok(updated)
    },
    { message: 'Failed to update TP step', code: 'DB_ERROR' }
  )
}

export async function startTPSession(
  input: z.infer<typeof StartTPSessionSchema>
): Promise<ActionResult<{ sessionId: string; wsUrl: string }>> {
  const v = StartTPSessionSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`tp-start:${v.data.tpId}`, 5, 60)
  if (!allowed) return err('Trop de démarrages, patiente un instant.', 'RATE_LIMIT')

  return runAction(
    async () => {
      const { sessionId } = await tpService.startSession(v.data.tpId)
      return ok({ sessionId, wsUrl: terminalWsUrl(sessionId) })
    },
    { message: 'Failed to start TP session', exposeError: true }
  )
}

export async function stopTPSession(input: z.infer<typeof StopTPSessionSchema>): Promise<ActionResult> {
  const v = StopTPSessionSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      await tpService.stopSession(v.data.sessionId)
      return ok(undefined)
    },
    { message: 'Failed to stop TP session', code: 'DB_ERROR' }
  )
}
