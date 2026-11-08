'use client'

import { useCallback, useState, useTransition } from 'react'
import { reviewFlashcard } from '@/actions'
import type { Flashcard, SM2Quality } from '@/domain'

export interface FlashcardReviewState {
  current: Flashcard | null
  remaining: number
  /** Cards in the session at start. */
  total: number
  /** Cards already graded in this session. */
  reviewed: number
  flipped: boolean
  flip: () => void
  grade: (quality: SM2Quality) => void
  isPending: boolean
  error: string | null
}

export function useFlashcardReview(initialCards: Flashcard[]): FlashcardReviewState {
  const [total] = useState(initialCards.length)
  const [queue, setQueue] = useState(initialCards)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const current = queue[0] ?? null

  const flip = useCallback(() => setFlipped((f) => !f), [])

  const grade = useCallback(
    (quality: SM2Quality) => {
      if (!current || isPending) return
      startTransition(async () => {
        const res = await reviewFlashcard({ flashcardId: current.id, quality })
        if (!res.success) {
          // Keep the card in place so the grade can be retried.
          setError("La note n'a pas pu être enregistrée — réessaie.")
          return
        }
        setError(null)
        setQueue((q) => q.slice(1))
        setFlipped(false)
      })
    },
    [current, isPending]
  )

  return { current, remaining: queue.length, total, reviewed: total - queue.length, flipped, flip, grade, isPending, error }
}
