'use client'

import { useState } from 'react'
import { QuestionCard, OPTION_LETTERS } from './QuestionCard'
import { QuizResult } from './QuizResult'
import { Button } from '@/components/ui/button'
import { useQuizSession } from '@/hooks/useQuizSession'
import { useKeydown } from '@/hooks/useKeydown'
import type { Quiz } from '@/domain'

function Kbd({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <kbd className="rounded border border-border bg-background px-1.5 font-mono text-[11px]">{children}</kbd>
}

// Maps 1–4 / A–D (case-insensitive) to an option index.
function optionFromKey(key: string, count: number): number | null {
  const digit = Number.parseInt(key, 10)
  if (digit >= 1 && digit <= count) return digit - 1
  const letter = OPTION_LETTERS.indexOf(key.toUpperCase() as (typeof OPTION_LETTERS)[number])
  return letter >= 0 && letter < count ? letter : null
}

export function QuizSession({ quiz }: { quiz: Quiz }): React.JSX.Element {
  const {
    currentIndex,
    currentQuestion,
    total,
    selected,
    revealed,
    result,
    isSubmitting,
    select,
    reveal,
    next,
    restart,
  } = useQuizSession(quiz)

  const [key, setKey] = useState(0)
  const isLast = currentIndex + 1 === total

  useKeydown((e) => {
    if (isSubmitting) return

    const choice = optionFromKey(e.key, currentQuestion.options.length)
    if (choice !== null) {
      if (!revealed) {
        e.preventDefault()
        select(choice)
      }
      return
    }

    if (e.key === 'Enter') {
      const target = e.target as HTMLElement | null
      // Enter on a focused, not-yet-selected option selects it (native button behavior).
      const optionEl = target?.closest<HTMLElement>('[data-option-index]')
      if (optionEl && !revealed && Number(optionEl.dataset.optionIndex) !== selected) return
      // Any other focused link/button keeps its own Enter behavior.
      if (!optionEl && target?.closest('a, button')) return

      e.preventDefault()
      if (!revealed) reveal()
      else next()
    }
  }, !result)

  if (result) {
    return (
      <QuizResult
        result={result}
        onRetry={() => {
          restart()
          setKey((k) => k + 1)
        }}
      />
    )
  }

  return (
    <div key={key} className="space-y-4">
      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={total}
        selected={selected}
        revealed={revealed}
        onSelect={select}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="hidden items-center gap-1.5 text-xs text-text-secondary sm:flex">
          <Kbd>1</Kbd>–<Kbd>4</Kbd> ou <Kbd>A</Kbd>–<Kbd>D</Kbd> choisir · <Kbd>Entrée</Kbd> {revealed ? 'continuer' : 'valider'}
        </p>
        <div className="ml-auto flex gap-2">
          {!revealed ? (
            <Button key="validate" disabled={selected === null} onClick={reveal} aria-keyshortcuts="Enter">
              Valider
            </Button>
          ) : (
            <Button key="next" disabled={isSubmitting} onClick={next} aria-keyshortcuts="Enter" autoFocus>
              {isSubmitting ? 'Correction…' : isLast ? 'Voir le résultat' : 'Question suivante'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
