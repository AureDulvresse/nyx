import { z } from 'zod'

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
})

export const AskNyxContextSchema = z.object({
  kind: z.enum(['chapter', 'lab', 'tp']),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().max(6000),
})

export const AskNyxSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(30),
  context: AskNyxContextSchema.optional(),
})

export const SpeakSchema = z.object({
  // Generous ceiling: this also feeds "read this chapter aloud", where the cleaned markdown
  // of a full chapter easily runs several thousand characters — not just short chat replies.
  text: z.string().trim().min(1).max(20000),
})
