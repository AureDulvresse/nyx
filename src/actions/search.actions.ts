'use server'

import { z } from 'zod'
import { searchRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { SearchResultItem } from '@/domain'
import { GlobalSearchSchema } from '@/lib/schemas'

export async function globalSearch(input: z.infer<typeof GlobalSearchSchema>): Promise<ActionResult<SearchResultItem[]>> {
  const v = GlobalSearchSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const results = await searchRepo.search(v.data.query)
    return ok(results)
  } catch {
    return err('Failed to search', 'DB_ERROR')
  }
}
