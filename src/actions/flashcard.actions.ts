'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { flashcardRepo } from '@/repositories'
import { FlashcardService } from '@/services'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import type { Flashcard } from '@/domain'
import { ReviewFlashcardSchema, CreateFlashcardSchema } from '@/lib/schemas'

export async function reviewFlashcard(
  input: z.infer<typeof ReviewFlashcardSchema>
): Promise<ActionResult<Flashcard>> {
  const v = ReviewFlashcardSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const card = await flashcardRepo.findById(v.data.flashcardId)
      if (!card) return err('Flashcard introuvable', 'NOT_FOUND')

      const result = FlashcardService.calculateSM2(card, v.data.quality)
      const updated = await flashcardRepo.applyReview(v.data.flashcardId, result)
      revalidatePath('/flashcards')
      return ok(updated)
    },
    { message: 'Failed to review flashcard', code: 'DB_ERROR' }
  )
}

export async function createFlashcard(
  input: z.infer<typeof CreateFlashcardSchema>
): Promise<ActionResult<Flashcard>> {
  const v = CreateFlashcardSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  return runAction(
    async () => {
      const card = await flashcardRepo.create(v.data)
      revalidatePath('/flashcards')
      return ok(card)
    },
    { message: 'Failed to create flashcard', code: 'DB_ERROR' }
  )
}
