'use client'

import { cn } from '@/lib/utils/cn'
import type { QuizQuestion } from '@/domain'

export function ExamNav({
  questions,
  currentIndex,
  answersByQuestion,
  onGoTo,
}: {
  questions: QuizQuestion[]
  currentIndex: number
  answersByQuestion: Record<string, number>
  onGoTo: (index: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {questions.map((q, i) => {
        const answered = answersByQuestion[q.id] !== undefined
        const current = i === currentIndex
        return (
          <button
            key={q.id}
            onClick={() => onGoTo(i)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors',
              current
                ? 'border-violet-nyx bg-violet-nyx text-white'
                : answered
                  ? 'border-teal/40 bg-teal/10 text-teal'
                  : 'border-border text-text-secondary hover:border-violet-nyx/50'
            )}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
