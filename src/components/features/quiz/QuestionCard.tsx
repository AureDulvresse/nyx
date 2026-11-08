'use client'

import { CheckmarkCircle02Icon, CancelCircleIcon, BulbIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { QuizQuestion } from '@/domain'

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

export function QuestionCard({
  question,
  index,
  total,
  selected,
  revealed,
  onSelect,
}: {
  question: QuizQuestion
  index: number
  total: number
  selected: number | null
  revealed: boolean
  onSelect: (choice: number) => void
}): React.JSX.Element {
  const correctIndices: number[] = Array.isArray(question.correct) ? question.correct : [question.correct]
  const isRight = revealed && selected !== null && correctIndices.includes(selected)
  // Progress counts answered questions: the current one counts once validated.
  const answered = index + (revealed ? 1 : 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm text-text-secondary">
          <span>
            Question <span className="font-medium text-text-primary">{index + 1}</span> / {total}
          </span>
          <span className="text-xs capitalize">{question.difficulty === 'easy' ? 'facile' : question.difficulty === 'medium' ? 'moyen' : 'difficile'}</span>
        </div>
        <div role="progressbar" aria-label="Progression du quiz" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}>
          <Progress value={(answered / total) * 100} className="h-1.5" />
        </div>
      </div>

      <h3 id={`q-${question.id}`} className="mb-5 text-lg font-medium text-text-primary">
        {question.question}
      </h3>

      <div role="radiogroup" aria-labelledby={`q-${question.id}`} className="space-y-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i
          const isCorrect = revealed && correctIndices.includes(i)
          const isWrong = revealed && isSelected && !correctIndices.includes(i)

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={revealed}
              aria-keyshortcuts={`${i + 1} ${OPTION_LETTERS[i]}`}
              data-option-index={i}
              onClick={() => !revealed && onSelect(i)}
              className={cn(
                'flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx',
                'border-border bg-background text-text-primary',
                !revealed && 'hover:border-violet-nyx/50',
                isSelected && !revealed && 'border-violet-nyx bg-violet-nyx/10',
                isCorrect && 'border-green bg-green/10 text-green',
                isWrong && 'border-red bg-red/10 text-red',
                revealed && !isCorrect && !isWrong && 'opacity-60'
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded border font-mono text-xs',
                  isSelected && !revealed ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary',
                  isCorrect && 'border-green text-green',
                  isWrong && 'border-red text-red'
                )}
              >
                {OPTION_LETTERS[i]}
              </span>
              <span className="flex-1 pt-0.5">{option}</span>
              {isCorrect && <CheckmarkCircle02Icon size={18} className="shrink-0" aria-label="Bonne réponse" />}
              {isWrong && <CancelCircleIcon size={18} className="shrink-0" aria-label="Ta réponse, incorrecte" />}
            </button>
          )
        })}
      </div>

      {/* Always mounted so the live region announces the verdict when it appears. */}
      <div aria-live="polite">
        {revealed && (
          <div
            className={cn(
              'mt-5 rounded-md border-l-4 bg-background p-4',
              isRight ? 'border-green' : 'border-red'
            )}
          >
            <p className={cn('mb-1 flex items-center gap-2 text-sm font-semibold', isRight ? 'text-green' : 'text-red')}>
              {isRight ? <CheckmarkCircle02Icon size={16} aria-hidden /> : <CancelCircleIcon size={16} aria-hidden />}
              {isRight
                ? 'Bonne réponse !'
                : `Raté — la bonne réponse était ${correctIndices.map((c) => OPTION_LETTERS[c]).join(', ')}.`}
            </p>
            <p className="flex gap-2 text-sm leading-relaxed text-text-secondary">
              <BulbIcon size={16} className="mt-0.5 shrink-0 text-orange" aria-hidden />
              <span>{question.explanation}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
