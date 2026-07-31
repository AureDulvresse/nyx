import { z } from 'zod'

export const ReviewFlashcardSchema = z.object({
  flashcardId: z.string().min(1),
  quality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
})

export const CreateFlashcardSchema = z.object({
  deck: z.string().min(1),
  chapterId: z.string().optional(),
  front: z.string().min(1),
  back: z.string().min(1),
})
