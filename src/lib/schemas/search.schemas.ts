import { z } from 'zod'

export const GlobalSearchSchema = z.object({
  query: z.string().min(1).max(200),
})
