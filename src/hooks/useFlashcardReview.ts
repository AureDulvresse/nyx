'use client'

import { useCallback, useState, useTransition } from 'react'
import { reviewFlashcard } from '@/actions'
import type { Flashcard, SM2Quality } from '@/domain'

export function useFlashcardReview(initialCards: Flashcard[]) {
  const [queue, setQueue] = useState(initialCards)
  const [flipped, setFlipped] = useState(false)
  const [isPending, startTransition] = useTransition()

  const current = queue[0] ?? null

  const flip = useCallback(() => setFlipped((f) => !f), [])

  const grade = useCallback(
    (quality: SM2Quality) => {
      if (!current) return
      startTransition(async () => {
        await reviewFlashcard({ flashcardId: current.id, quality })
        setQueue((q) => q.slice(1))
        setFlipped(false)
      })
    },
    [current]
  )

  return { current, remaining: queue.length, flipped, flip, grade, isPending }
}
