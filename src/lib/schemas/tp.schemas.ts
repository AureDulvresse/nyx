import { z } from 'zod'

export const UpdateTPNotesSchema = z.object({
  tpId: z.string().min(1),
  notes: z.string().max(10_000),
})

export const CompleteTPSchema = z.object({
  tpId: z.string().min(1),
})

export const StartTPSessionSchema = z.object({
  tpId: z.string().min(1),
})

export const StopTPSessionSchema = z.object({
  sessionId: z.string().min(1),
})

export const UpdateTPStepSchema = z.object({
  tpId: z.string().min(1),
  stepIndex: z.number().int().min(0),
  completed: z.boolean(),
})
