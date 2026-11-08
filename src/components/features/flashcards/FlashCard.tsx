'use client'

import { cn } from '@/lib/utils/cn'
import type { Flashcard } from '@/domain'

export function FlashCard({ card, flipped, onFlip }: { card: Flashcard; flipped: boolean; onFlip: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onFlip}
      data-flashcard
      aria-label={flipped ? 'Réponse affichée — cliquer pour revoir la question' : 'Retourner la carte pour voir la réponse'}
      className={cn(
        'flex min-h-72 w-full max-w-xl flex-col items-center justify-center gap-4 rounded-xl border p-8 text-center transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        flipped ? 'border-violet-nyx/40 bg-violet-nyx/10' : 'border-border bg-surface hover:border-violet-nyx/40'
      )}
    >
      <span className="text-xs uppercase tracking-wider text-text-secondary">{flipped ? 'Réponse' : 'Question'}</span>
      {/* aria-live so screen readers hear the answer when the card flips. */}
      <p aria-live="polite" className="whitespace-pre-line text-xl font-medium text-text-primary">
        {flipped ? card.back : card.front}
      </p>
      {!flipped && (
        <span className="text-xs text-text-secondary">
          Clique ou appuie sur <kbd className="rounded border border-border bg-background px-1.5 font-mono">Espace</kbd> pour
          révéler
        </span>
      )}
    </button>
  )
}
