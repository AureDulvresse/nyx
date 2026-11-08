'use server'

import { z } from 'zod'
import { labRepo } from '@/repositories'
import { dockerLabService } from '@/infrastructure/docker/docker.service'
import { LabService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { terminalWsUrl } from '@/lib/constants'
import type { LabSession, FlagSubmitResult, HintUnlockResult } from '@/domain'
import { StartLabSchema, SubmitFlagSchema, UnlockHintSchema } from '@/lib/schemas'

const labService = new LabService(labRepo, dockerLabService)

export async function startLabSession(
  input: z.infer<typeof StartLabSchema>
): Promise<ActionResult<{ session: LabSession; wsUrl: string }>> {
  const v = StartLabSchema.safeParse(input)
  if (!v.success) return err(v.error.message)

  const allowed = await checkRateLimit(`lab-start:${v.data.userId}`, 5, 60)
  if (!allowed) return err('Trop de démarrages de lab, patiente un instant.', 'RATE_LIMIT')

  return runAction(
    async () => {
      const session = await labService.startSession(v.data.labId)
      return ok({ session, wsUrl: terminalWsUrl(session.id) })
    },
    { message: 'Failed to start lab', exposeError: true }
  )
}

export async function submitFlag(
  input: z.infer<typeof SubmitFlagSchema>
): Promise<ActionResult<FlagSubmitResult>> {
  const v = SubmitFlagSchema.safeParse(input)
  if (!v.success) return err(v.error.message)

  const allowed = await checkRateLimit(`flag-submit:${v.data.sessionId}`, 10, 30)
  if (!allowed) return err('Trop de tentatives, patiente quelques secondes.', 'RATE_LIMIT')

  return runAction(
    async () => ok(await labService.submitFlag(v.data.sessionId, v.data.flagValue, v.data.activeElapsedSeconds)),
    { message: 'Failed to submit flag', exposeError: true }
  )
}

export async function unlockHint(
  input: z.infer<typeof UnlockHintSchema>
): Promise<ActionResult<HintUnlockResult>> {
  const v = UnlockHintSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`hint-unlock:${v.data.sessionId}`, 10, 30)
  if (!allowed) return err('Trop de tentatives, patiente quelques secondes.', 'RATE_LIMIT')

  return runAction(async () => ok(await labService.unlockHint(v.data.sessionId, v.data.flagId)), {
    message: 'Failed to unlock hint',
    exposeError: true,
  })
}

export async function stopLabSession(sessionId: string): Promise<ActionResult> {
  if (!sessionId) return err('sessionId required')

  return runAction(
    async () => {
      await labService.stopSession(sessionId)
      return ok(undefined)
    },
    { message: 'Failed to stop lab session' }
  )
}
