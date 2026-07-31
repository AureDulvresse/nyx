'use client'

import { FlashCard } from './FlashCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useFlashcardReview } from '@/hooks/useFlashcardReview'
import type { Flashcard } from '@/domain'

const QUALITY_BUTTONS: { quality: 0 | 1 | 2 | 3 | 4 | 5; label: string; variant: 'destructive' | 'secondary' | 'success' }[] = [
  { quality: 0, label: 'Encore', variant: 'destructive' },
  { quality: 3, label: 'Difficile', variant: 'secondary' },
  { quality: 5, label: 'Facile', variant: 'success' },
]

export function ReviewSession({ cards }: { cards: Flashcard[] }) {
  const { current, remaining, flipped, flip, grade, isPending } = useFlashcardReview(cards)

  if (!current) {
    return (
      <Card className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-xl font-semibold text-text-primary">Session terminée !</p>
        <p className="text-text-secondary">Toutes les cartes dues ont été révisées.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-text-secondary">{remaining} carte{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}</p>
      <FlashCard card={current} flipped={flipped} onFlip={flip} />
      {flipped && (
        <div className="flex gap-2">
          {QUALITY_BUTTONS.map((b) => (
            <Button key={b.quality} variant={b.variant} disabled={isPending} onClick={() => grade(b.quality)}>
              {b.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
