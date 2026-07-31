'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { chapterRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { Chapter } from '@/domain'
import { UpdateChapterStatusSchema, UpdateChapterNotesSchema, MarkChapterReviewedSchema } from '@/lib/schemas'

export async function updateChapterStatus(
  input: z.infer<typeof UpdateChapterStatusSchema>
): Promise<ActionResult<Chapter>> {
  const v = UpdateChapterStatusSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const chapter = await chapterRepo.updateStatus(v.data.chapterId, v.data.status)
    revalidatePath('/courses')
    revalidatePath(`/courses/${chapter.courseId}`)
    return ok(chapter)
  } catch {
    return err('Failed to update chapter', 'DB_ERROR')
  }
}

export async function updateChapterNotes(
  input: z.infer<typeof UpdateChapterNotesSchema>
): Promise<ActionResult<Chapter>> {
  const v = UpdateChapterNotesSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const chapter = await chapterRepo.updateNotes(v.data.chapterId, v.data.notes)
    revalidatePath(`/courses/${chapter.courseId}`)
    return ok(chapter)
  } catch {
    return err('Failed to update notes', 'DB_ERROR')
  }
}

export async function markChapterReviewed(
  input: z.infer<typeof MarkChapterReviewedSchema>
): Promise<ActionResult<Chapter>> {
  const v = MarkChapterReviewedSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const chapter = await chapterRepo.markReviewed(v.data.chapterId)
    revalidatePath(`/courses/${chapter.courseId}`)
    return ok(chapter)
  } catch {
    return err('Failed to mark chapter as reviewed', 'DB_ERROR')
  }
}
