'use client'

import Link from 'next/link'
import { CheckmarkCircle02Icon } from 'hugeicons-react'
import { FlashCard } from './FlashCard'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useFlashcardReview } from '@/hooks/useFlashcardReview'
import { useKeydown } from '@/hooks/useKeydown'
import type { Flashcard, SM2Quality } from '@/domain'

// Anki-style 4-point scale mapped onto SM-2 qualities; keys 1–4.
const QUALITY_BUTTONS: {
  key: string
  quality: SM2Quality
  label: string
  hint: string
  variant: 'destructive' | 'secondary' | 'outline' | 'success'
}[] = [
  { key: '1', quality: 0, label: 'Encore', hint: 'Oublié', variant: 'destructive' },
  { key: '2', quality: 3, label: 'Difficile', hint: 'Avec effort', variant: 'secondary' },
  { key: '3', quality: 4, label: 'Bien', hint: 'Après réflexion', variant: 'outline' },
  { key: '4', quality: 5, label: 'Facile', hint: 'Immédiat', variant: 'success' },
]

function Kbd({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <kbd className="rounded border border-border bg-background px-1.5 font-mono text-[11px]">{children}</kbd>
}

export function ReviewSession({ cards }: { cards: Flashcard[] }): React.JSX.Element {
  const { current, total, reviewed, flipped, flip, grade, isPending, error } = useFlashcardReview(cards)

  useKeydown((e) => {
    if (!current || isPending) return

    if (e.key === ' ' || e.key === 'Enter') {
      // Let Enter/Space activate another focused control (e.g. a rating button) natively.
      const target = e.target as HTMLElement | null
      if (target?.closest('button, a') && !target.closest('[data-flashcard]')) return
      e.preventDefault()
      flip()
      return
    }

    if (!flipped) return
    const button = QUALITY_BUTTONS.find((b) => b.key === e.key)
    if (button) {
      e.preventDefault()
      grade(button.quality)
    }
  }, total > 0)

  if (!current) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <CheckmarkCircle02Icon size={36} className="text-green" aria-hidden />
        <p className="text-xl font-semibold text-text-primary" role="status">
          {total > 0 ? 'Session terminée !' : 'Aucune carte à réviser'}
        </p>
        <p className="text-text-secondary">
          {total > 0
            ? `${total} carte${total > 1 ? 's' : ''} révisée${total > 1 ? 's' : ''} — reviens quand les prochaines seront dues.`
            : 'Toutes les cartes de ce deck sont à jour.'}
        </p>
        <Link href="/flashcards" className={buttonVariants({ variant: 'secondary', className: 'mt-2' })}>
          Retour aux decks
        </Link>
      </Card>
    )
  }

  const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-xl">
        <div className="mb-1.5 flex justify-between text-sm text-text-secondary">
          <span>
            Carte <span className="font-medium text-text-primary">{reviewed + 1}</span> / {total}
          </span>
          <span>{percentage}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Progression de la session"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={reviewed}
        >
          <Progress value={percentage} className="h-1.5" />
        </div>
      </div>

      <FlashCard card={current} flipped={flipped} onFlip={flip} />

      {flipped ? (
        <div className="grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Évalue ta réponse">
          {QUALITY_BUTTONS.map((b) => (
            <Button
              key={b.quality}
              variant={b.variant}
              disabled={isPending}
              onClick={() => grade(b.quality)}
              aria-keyshortcuts={b.key}
              className="h-auto flex-col gap-0.5 py-2"
            >
              <span className="flex items-center gap-1.5">
                <Kbd>{b.key}</Kbd> {b.label}
              </span>
              <span className="text-[11px] font-normal opacity-80">{b.hint}</span>
            </Button>
          ))}
        </div>
      ) : (
        <Button onClick={flip} aria-keyshortcuts="Space Enter">
          Afficher la réponse
        </Button>
      )}

      {error && (
        <p role="alert" className="text-sm text-red">
          {error}
        </p>
      )}

      <p className="hidden items-center gap-2 text-xs text-text-secondary sm:flex">
        <Kbd>Espace</Kbd> / <Kbd>Entrée</Kbd> retourner · <Kbd>1</Kbd>–<Kbd>4</Kbd> noter
      </p>
    </div>
  )
}
