import { z } from 'zod'

export const SpeakSchema = z.object({
  text: z.string().trim().min(1).max(4000),
})

export type SpeakInput = z.infer<typeof SpeakSchema>
