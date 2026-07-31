'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { tpRepo } from '@/repositories'
import { dockerLabService } from '@/infrastructure/docker/docker.service'
import { TPService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { checkRateLimit } from '@/lib/utils/rate-limit'
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

  try {
    const tp = await tpRepo.updateNotes(v.data.tpId, v.data.notes)
    revalidatePath('/tp')
    return ok(tp)
  } catch {
    return err('Failed to update TP notes', 'DB_ERROR')
  }
}

export async function completeTP(input: z.infer<typeof CompleteTPSchema>): Promise<ActionResult<TP>> {
  const v = CompleteTPSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const tp = await tpRepo.complete(v.data.tpId)
    revalidatePath('/tp')
    return ok(tp)
  } catch {
    return err('Failed to complete TP', 'DB_ERROR')
  }
}

export async function updateTPStep(input: z.infer<typeof UpdateTPStepSchema>): Promise<ActionResult<TP>> {
  const v = UpdateTPStepSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const tp = await tpRepo.findById(v.data.tpId)
    if (!tp) return err('TP introuvable', 'NOT_FOUND')

    const steps = tp.steps.map((step, i) => (i === v.data.stepIndex ? { ...step, completed: v.data.completed } : step))
    const updated = await tpRepo.updateSteps(v.data.tpId, steps)
    revalidatePath('/tp')
    return ok(updated)
  } catch {
    return err('Failed to update TP step', 'DB_ERROR')
  }
}

export async function startTPSession(
  input: z.infer<typeof StartTPSessionSchema>
): Promise<ActionResult<{ sessionId: string; wsUrl: string }>> {
  const v = StartTPSessionSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`tp-start:${v.data.tpId}`, 5, 60)
  if (!allowed) return err('Trop de démarrages, patiente un instant.', 'RATE_LIMIT')

  try {
    const { sessionId } = await tpService.startSession(v.data.tpId)
    return ok({ sessionId, wsUrl: `/ws/terminal?sessionId=${sessionId}` })
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to start TP session')
  }
}

export async function stopTPSession(input: z.infer<typeof StopTPSessionSchema>): Promise<ActionResult> {
  const v = StopTPSessionSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    await tpService.stopSession(v.data.sessionId)
    return ok(undefined)
  } catch {
    return err('Failed to stop TP session', 'DB_ERROR')
  }
}
