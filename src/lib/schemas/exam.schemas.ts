import { z } from 'zod'

export const StartExamSchema = z.object({
  examId: z.string().min(1),
})

export const SubmitExamSchema = z.object({
  token: z.string().uuid(),
  answers: z
    .array(z.object({ questionId: z.string(), chosen: z.array(z.number().int().min(0).max(3)).max(4) }))
    .max(200),
})
