import type { AskNyxContext, ChatMessage } from '@/domain'
import { getOllamaModel, getOllamaUrl } from './ollama.client'
import type { OllamaChatResponse } from './ai.types'

export interface IAIService {
  chat(messages: ChatMessage[], context?: AskNyxContext): Promise<string>
}

const BASE_SYSTEM_PROMPT = `Tu es Ask Nyx, l'assistant intégré à Nyx, une plateforme personnelle d'apprentissage en cybersécurité.
Réponds toujours en français, de façon concise et pédagogique. Tu peux expliquer des concepts offensifs et défensifs
(pentest, exploitation, forensics...) car le contexte est strictement éducatif et les labs sont isolés dans des réseaux
Docker dédiés. Si une question sort du cadre de la cybersécurité ou de l'apprentissage technique, réponds brièvement
puis recentre vers le contenu de la plateforme.`

function buildSystemPrompt(context?: AskNyxContext): string {
  if (!context) return BASE_SYSTEM_PROMPT

  const kindLabel = context.kind === 'lab' ? 'lab' : context.kind === 'tp' ? 'TP' : 'chapitre de cours'
  return `${BASE_SYSTEM_PROMPT}

L'utilisateur consulte actuellement ce ${kindLabel} : "${context.title}".
Extrait du contenu pour te donner le contexte (ne le récite pas, utilise-le seulement pour répondre plus précisément) :
"""
${context.excerpt}
"""`
}

export class OllamaAIService implements IAIService {
  async chat(messages: ChatMessage[], context?: AskNyxContext): Promise<string> {
    const response = await fetch(`${getOllamaUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: getOllamaModel(),
        messages: [{ role: 'system', content: buildSystemPrompt(context) }, ...messages],
        stream: false,
      }),
    })

    if (!response.ok) throw new Error(`Ollama a répondu avec le statut ${response.status}`)

    const data = (await response.json()) as OllamaChatResponse
    return data.message?.content?.trim() ?? ''
  }
}

export const aiService: IAIService = new OllamaAIService()
