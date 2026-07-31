'use server'

import { z } from 'zod'
import { aiService } from '@/infrastructure/ai'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { AskNyxSchema } from '@/lib/schemas'

export async function askNyx(input: z.infer<typeof AskNyxSchema>): Promise<ActionResult<string>> {
  const v = AskNyxSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  const allowed = await checkRateLimit('ask-nyx:chat', 20, 60)
  if (!allowed) return err('Trop de messages envoyés, patiente un instant.', 'RATE_LIMIT')

  try {
    const reply = await aiService.chat(v.data.messages, v.data.context)
    return ok(reply)
  } catch {
    return err("Ask Nyx est indisponible pour le moment (le modèle Ollama est-il démarré ?).", 'AI_UNAVAILABLE')
  }
}
