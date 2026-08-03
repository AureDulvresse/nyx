import { z } from 'zod'

export const SubmitExamSchema = z.object({
  examId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string(), chosen: z.number().int().min(-1).max(3) })),
  duration: z.number().int().min(0),
})
