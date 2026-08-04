'use client'

import { CheckmarkSquare01Icon, Square01Icon, CheckmarkCircle01Icon, CircleIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { isMultiSelect } from '@/hooks/useExamSession'
import type { QuizQuestion } from '@/domain'

// Unlike QuestionCard (chapter quizzes), there's no per-question reveal here — real exam
// conditions mean you don't find out if you were right until the whole thing is submitted.
export function ExamQuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: {
  question: QuizQuestion
  index: number
  total: number
  selected: number[]
  onSelect: (choice: number) => void
}) {
  const multi = isMultiSelect(question)
  const OptionIcon = multi
    ? (i: number) => (selected.includes(i) ? CheckmarkSquare01Icon : Square01Icon)
    : (i: number) => (selected.includes(i) ? CheckmarkCircle01Icon : CircleIcon)

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm text-text-secondary">
          Question {index + 1} / {total}
        </p>
        {multi && <Badge variant="outline">Plusieurs réponses possibles</Badge>}
      </div>
      <h3 className="mb-5 text-lg font-medium text-text-primary">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((option, i) => {
          const Icon = OptionIcon(i)
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors',
                'border-border bg-background text-text-primary hover:border-violet-nyx/50',
                selected.includes(i) && 'border-violet-nyx bg-violet-nyx/10'
              )}
            >
              <Icon size={18} className={cn('shrink-0', selected.includes(i) ? 'text-purple' : 'text-text-secondary')} />
              {option}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
