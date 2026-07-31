'use server'

import { z } from 'zod'
import { labRepo } from '@/repositories'
import { dockerLabService } from '@/infrastructure/docker/docker.service'
import { LabService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import type { LabSession, FlagSubmitResult } from '@/domain'
import { StartLabSchema, SubmitFlagSchema } from '@/lib/schemas'

const labService = new LabService(labRepo, dockerLabService)

export async function startLabSession(
  input: z.infer<typeof StartLabSchema>
): Promise<ActionResult<{ session: LabSession; wsUrl: string }>> {
  const v = StartLabSchema.safeParse(input)
  if (!v.success) return err(v.error.message)

  const allowed = await checkRateLimit(`lab-start:${v.data.userId}`, 5, 60)
  if (!allowed) return err('Trop de démarrages de lab, patiente un instant.', 'RATE_LIMIT')

  try {
    const session = await labService.startSession(v.data.labId, v.data.userId)
    return ok({ session, wsUrl: `/ws/terminal?sessionId=${session.id}` })
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to start lab')
  }
}

export async function submitFlag(
  input: z.infer<typeof SubmitFlagSchema>
): Promise<ActionResult<FlagSubmitResult>> {
  const v = SubmitFlagSchema.safeParse(input)
  if (!v.success) return err(v.error.message)

  const allowed = await checkRateLimit(`flag-submit:${v.data.sessionId}`, 10, 30)
  if (!allowed) return err('Trop de tentatives, patiente quelques secondes.', 'RATE_LIMIT')

  try {
    const result = await labService.submitFlag(v.data.sessionId, v.data.flagValue, v.data.activeElapsedSeconds)
    return ok(result)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to submit flag')
  }
}

export async function stopLabSession(sessionId: string): Promise<ActionResult> {
  if (!sessionId) return err('sessionId required')
  try {
    await labService.stopSession(sessionId)
    return ok(undefined)
  } catch {
    return err('Failed to stop lab session')
  }
}
