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

const LAB_COACH_INSTRUCTIONS = `Dans un lab, tu joues un rôle de coach, pas de solutionnaire : ne révèle jamais la valeur
d'un flag (FLAG{...}), et ne donne jamais directement le contenu d'un indice que l'utilisateur n'a pas encore
débloqué (bouton "Débloquer l'indice" dans la barre latérale, contre des points). Guide plutôt par des questions
et des pistes méthodologiques (quelle étape de la méthodologie es-tu en train d'appliquer ? qu'as-tu déjà essayé ?),
en t'appuyant sur les indices déjà débloqués listés ci-dessous s'il y en a. Si l'utilisateur semble bloqué au-delà
de ce que ces indices débloqués permettent, suggère-lui explicitement de débloquer le prochain indice plutôt que
de lui donner l'information gratuitement.`

function buildSystemPrompt(context?: AskNyxContext): string {
  if (!context) return BASE_SYSTEM_PROMPT

  const kindLabel = context.kind === 'lab' ? 'lab' : context.kind === 'tp' ? 'TP' : 'chapitre de cours'

  const hintsSection =
    context.kind === 'lab'
      ? `\n\n${LAB_COACH_INSTRUCTIONS}\n\nIndices déjà débloqués par l'utilisateur pour ce lab (${context.unlockedHints?.length ?? 0}/${context.totalHints ?? 0}) :\n${
          context.unlockedHints?.length
            ? context.unlockedHints.map((h, i) => `${i + 1}. ${h}`).join('\n')
            : 'Aucun indice débloqué pour le moment.'
        }`
      : ''

  return `${BASE_SYSTEM_PROMPT}

L'utilisateur consulte actuellement ce ${kindLabel} : "${context.title}".
Extrait du contenu pour te donner le contexte (ne le récite pas, utilise-le seulement pour répondre plus précisément) :
"""
${context.excerpt}
"""${hintsSection}`
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
        // Cold-loading this model into RAM can take minutes on a constrained host (disk I/O,
        // no GPU) — keep it resident for a long time after use so that cost is paid once per
        // idle stretch instead of on every message the user sends after a short pause.
        keep_alive: '30m',
      }),
    })

    if (!response.ok) throw new Error(`Ollama a répondu avec le statut ${response.status}`)

    const data = (await response.json()) as OllamaChatResponse
    return data.message?.content?.trim() ?? ''
  }
}

export const aiService: IAIService = new OllamaAIService()
