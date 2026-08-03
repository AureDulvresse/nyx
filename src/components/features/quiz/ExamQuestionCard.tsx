'use client'

import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
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
  selected: number | undefined
  onSelect: (choice: number) => void
}) {
  return (
    <Card className="p-6">
      <p className="mb-1 text-sm text-text-secondary">
        Question {index + 1} / {total}
      </p>
      <h3 className="mb-5 text-lg font-medium text-text-primary">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              'w-full rounded-md border px-4 py-3 text-left text-sm transition-colors',
              'border-border bg-background text-text-primary hover:border-violet-nyx/50',
              selected === i && 'border-violet-nyx bg-violet-nyx/10'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </Card>
  )
}
