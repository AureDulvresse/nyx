import { z } from 'zod'

export const AddCommentSchema = z.object({
  chapterId: z.string().min(1),
  author: z.string().trim().min(1).max(60).default('Aure'),
  content: z.string().trim().min(1).max(2000),
})

export const DeleteCommentSchema = z.object({
  commentId: z.string().min(1),
})

const HTTP_URL = z
  .string()
  .trim()
  .max(2000)
  .url()
  .refine((url) => /^https?:\/\//i.test(url), { message: 'Seuls les liens http(s) sont autorisés' })

export const AddResourceSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().trim().min(1).max(150),
  url: HTTP_URL,
  type: z.enum(['link', 'pdf', 'video', 'tool', 'article', 'image']).default('link'),
  note: z.string().trim().max(500).optional(),
})

export const DeleteResourceSchema = z.object({
  resourceId: z.string().min(1),
})
