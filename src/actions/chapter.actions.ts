'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { chapterRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import type { Chapter } from '@/domain'
import {
  UpdateChapterStatusSchema,
  UpdateChapterNotesSchema,
  MarkChapterReviewedSchema,
  MarkChapterStartedSchema,
} from '@/lib/schemas'

export async function updateChapterStatus(
  input: z.infer<typeof UpdateChapterStatusSchema>
): Promise<ActionResult<Chapter>> {
  const v = UpdateChapterStatusSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const chapter = await chapterRepo.updateStatus(v.data.chapterId, v.data.status)
      revalidatePath('/')
      revalidatePath('/courses', 'layout')
      return ok(chapter)
    },
    { message: 'Failed to update chapter', code: 'DB_ERROR' }
  )
}

export async function updateChapterNotes(
  input: z.infer<typeof UpdateChapterNotesSchema>
): Promise<ActionResult<Chapter>> {
  const v = UpdateChapterNotesSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const chapter = await chapterRepo.updateNotes(v.data.chapterId, v.data.notes)
      revalidatePath('/courses', 'layout')
      return ok(chapter)
    },
    { message: 'Failed to update notes', code: 'DB_ERROR' }
  )
}

export async function markChapterReviewed(
  input: z.infer<typeof MarkChapterReviewedSchema>
): Promise<ActionResult<Chapter>> {
  const v = MarkChapterReviewedSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const chapter = await chapterRepo.markReviewed(v.data.chapterId)
      revalidatePath('/courses', 'layout')
      return ok(chapter)
    },
    { message: 'Failed to mark chapter as reviewed', code: 'DB_ERROR' }
  )
}

// Called when a chapter is opened: flags it "in_progress" so the dashboard can offer to resume it.
// Only revalidates list pages (not the chapter route itself) so the open page isn't re-rendered.
export async function markChapterStarted(
  input: z.infer<typeof MarkChapterStartedSchema>
): Promise<ActionResult<{ changed: boolean }>> {
  const v = MarkChapterStartedSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const changed = await chapterRepo.markStarted(v.data.chapterId)
      if (changed) {
        revalidatePath('/')
        revalidatePath('/courses')
      }
      return ok({ changed })
    },
    { message: 'Failed to mark chapter as started', code: 'DB_ERROR' }
  )
}
