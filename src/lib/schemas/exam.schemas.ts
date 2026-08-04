import { z } from 'zod'

export const SubmitExamSchema = z.object({
  examId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string(), chosen: z.array(z.number().int().min(0).max(3)).max(4) })),
  duration: z.number().int().min(0),
})
