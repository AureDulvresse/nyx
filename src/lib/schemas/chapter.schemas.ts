import { z } from 'zod'

export const UpdateChapterStatusSchema = z.object({
  chapterId: z.string().min(1),
  status: z.enum(['not_started', 'in_progress', 'completed']),
})

export const UpdateChapterNotesSchema = z.object({
  chapterId: z.string().min(1),
  notes: z.string().max(10_000),
})

export const MarkChapterReviewedSchema = z.object({
  chapterId: z.string().min(1),
})
