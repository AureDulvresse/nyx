'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { cheatRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { CheatEntry } from '@/domain'
import { SearchCheatSchema, ToggleFavoriteSchema } from '@/lib/schemas'

export async function searchCheat(input: z.infer<typeof SearchCheatSchema>): Promise<ActionResult<CheatEntry[]>> {
  const v = SearchCheatSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const entries = await cheatRepo.search(v.data.query, v.data.category)
    return ok(entries)
  } catch {
    return err('Failed to search cheatsheet', 'DB_ERROR')
  }
}

export async function toggleCheatFavorite(
  input: z.infer<typeof ToggleFavoriteSchema>
): Promise<ActionResult<CheatEntry>> {
  const v = ToggleFavoriteSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const entry = await cheatRepo.toggleFavorite(v.data.cheatId)
    revalidatePath('/cheatsheet')
    return ok(entry)
  } catch {
    return err('Failed to toggle favorite', 'DB_ERROR')
  }
}
