import { z } from 'zod'

export const StartLabSchema = z.object({
  labId: z.string().min(1),
  userId: z.string().min(1),
})

export const SubmitFlagSchema = z.object({
  sessionId: z.string().min(1),
  flagValue: z.string().min(1).max(256),
  activeElapsedSeconds: z.number().int().min(0).optional(),
})

export const UnlockHintSchema = z.object({
  sessionId: z.string().min(1),
  flagId: z.string().min(1),
})
