import { z } from 'zod'

export const GetCommandLogSchema = z.object({
  sessionId: z.string().min(1),
})
