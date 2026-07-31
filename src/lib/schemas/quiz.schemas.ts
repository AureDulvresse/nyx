import { z } from 'zod'

export const SubmitQuizSchema = z.object({
  quizId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string(), chosen: z.number().int().min(-1).max(3) })),
  duration: z.number().int().min(0),
})
