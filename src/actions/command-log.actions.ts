'use server'

import { z } from 'zod'
import { commandLogRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { CommandLogEntry } from '@/domain'
import { GetCommandLogSchema } from '@/lib/schemas'

export async function getCommandLog(input: z.infer<typeof GetCommandLogSchema>): Promise<ActionResult<CommandLogEntry[]>> {
  const v = GetCommandLogSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const entries = await commandLogRepo.findBySession(v.data.sessionId)
    return ok(entries)
  } catch {
    return err('Failed to load command log', 'DB_ERROR')
  }
}
