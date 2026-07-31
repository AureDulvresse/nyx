'use client'

import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import type { QuizQuestion } from '@/domain'

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
}) {
  return (
    <Card className="p-6">
      <p className="mb-1 text-sm text-text-secondary">Question {index + 1} / {total}</p>
      <h3 className="mb-5 text-lg font-medium text-text-primary">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i
          const isCorrect = revealed && i === question.correct
          const isWrong = revealed && isSelected && i !== question.correct

          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => onSelect(i)}
              className={cn(
                'w-full rounded-md border px-4 py-3 text-left text-sm transition-colors',
                'border-border bg-background text-text-primary hover:border-violet-nyx/50',
                isSelected && !revealed && 'border-violet-nyx bg-violet-nyx/10',
                isCorrect && 'border-green bg-green/10 text-green',
                isWrong && 'border-red bg-red/10 text-red'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>

      {revealed && (
        <p className="mt-4 rounded-md bg-background p-3 text-sm text-text-secondary">{question.explanation}</p>
      )}
    </Card>
  )
}
