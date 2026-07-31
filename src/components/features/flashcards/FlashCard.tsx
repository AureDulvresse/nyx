'use client'

import { cn } from '@/lib/utils/cn'
import type { Flashcard } from '@/domain'

export function FlashCard({ card, flipped, onFlip }: { card: Flashcard; flipped: boolean; onFlip: () => void }) {
  return (
    <button
      onClick={onFlip}
      className={cn(
        'flex h-72 w-full max-w-xl flex-col items-center justify-center gap-4 rounded-xl border border-border p-8 text-center transition-colors',
        flipped ? 'bg-violet-nyx/10' : 'bg-surface'
      )}
    >
      <span className="text-xs uppercase tracking-wider text-text-secondary">{flipped ? 'Réponse' : 'Question'}</span>
      <p className="text-xl font-medium text-text-primary">{flipped ? card.back : card.front}</p>
      {!flipped && <span className="text-xs text-text-secondary">Clique pour révéler</span>}
    </button>
  )
}
