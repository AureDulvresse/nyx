'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { commentRepo, resourceRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import type { Comment, Resource } from '@/domain'
import { AddCommentSchema, DeleteCommentSchema, AddResourceSchema, DeleteResourceSchema } from '@/lib/schemas'

export async function addComment(input: z.infer<typeof AddCommentSchema>): Promise<ActionResult<Comment>> {
  const v = AddCommentSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`comment:${v.data.chapterId}`, 20, 60)
  if (!allowed) return err('Trop de commentaires envoyés, réessaie dans un instant.', 'RATE_LIMIT')

  try {
    const comment = await commentRepo.create(v.data.chapterId, v.data.author, v.data.content)
    revalidatePath('/courses')
    return ok(comment)
  } catch {
    return err('Failed to add comment', 'DB_ERROR')
  }
}

export async function deleteComment(input: z.infer<typeof DeleteCommentSchema>): Promise<ActionResult> {
  const v = DeleteCommentSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    await commentRepo.delete(v.data.commentId)
    revalidatePath('/courses')
    return ok(undefined)
  } catch {
    return err('Failed to delete comment', 'DB_ERROR')
  }
}

export async function addResource(input: z.infer<typeof AddResourceSchema>): Promise<ActionResult<Resource>> {
  const v = AddResourceSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit(`resource:${v.data.chapterId}`, 20, 60)
  if (!allowed) return err('Trop de ressources ajoutées, réessaie dans un instant.', 'RATE_LIMIT')

  try {
    const resource = await resourceRepo.create(v.data)
    revalidatePath('/courses')
    return ok(resource)
  } catch {
    return err('Failed to add resource', 'DB_ERROR')
  }
}

export async function deleteResource(input: z.infer<typeof DeleteResourceSchema>): Promise<ActionResult> {
  const v = DeleteResourceSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    await resourceRepo.delete(v.data.resourceId)
    revalidatePath('/courses')
    return ok(undefined)
  } catch {
    return err('Failed to delete resource', 'DB_ERROR')
  }
}
