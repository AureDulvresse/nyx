'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { cheatRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import type { CheatEntry } from '@/domain'
import { SearchCheatSchema, ToggleFavoriteSchema } from '@/lib/schemas'

export async function searchCheat(input: z.infer<typeof SearchCheatSchema>): Promise<ActionResult<CheatEntry[]>> {
  const v = SearchCheatSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(async () => ok(await cheatRepo.search(v.data.query, v.data.category)), {
    message: 'Failed to search cheatsheet',
    code: 'DB_ERROR',
  })
}

export async function toggleCheatFavorite(
  input: z.infer<typeof ToggleFavoriteSchema>
): Promise<ActionResult<CheatEntry>> {
  const v = ToggleFavoriteSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const entry = await cheatRepo.toggleFavorite(v.data.cheatId)
      revalidatePath('/cheatsheet')
      return ok(entry)
    },
    { message: 'Failed to toggle favorite', code: 'DB_ERROR' }
  )
}
