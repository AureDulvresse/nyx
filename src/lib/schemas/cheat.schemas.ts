import { z } from 'zod'

export const SearchCheatSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().optional(),
})

export const ToggleFavoriteSchema = z.object({
  cheatId: z.string().min(1),
})
