'use server'

import { z } from 'zod'
import { commandLogRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import type { CommandLogEntry } from '@/domain'
import { GetCommandLogSchema } from '@/lib/schemas'

export async function getCommandLog(input: z.infer<typeof GetCommandLogSchema>): Promise<ActionResult<CommandLogEntry[]>> {
  const v = GetCommandLogSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(async () => ok(await commandLogRepo.findBySession(v.data.sessionId)), {
    message: 'Failed to load command log',
    code: 'DB_ERROR',
  })
}
