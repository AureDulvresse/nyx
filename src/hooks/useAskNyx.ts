'use client'

import { useCallback, useState } from 'react'
import { askNyx } from '@/actions'
import { useAskNyxStore } from '@/lib/store/ask-nyx.store'
import type { ChatMessage } from '@/domain'

export function useAskNyx() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const context = useAskNyxStore((s) => s.context)

  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      const userMessage: ChatMessage = { role: 'user', content }
      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)
      setIsPending(true)
      setError(null)

      const result = await askNyx({ messages: nextMessages, context: context ?? undefined })
      setIsPending(false)

      if (result.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.data }])
        return result.data
      }

      setError(result.error)
      return null
    },
    [messages, context]
  )

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isPending, error, sendMessage, reset, context }
}
