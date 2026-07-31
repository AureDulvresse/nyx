'use client'

import { useState } from 'react'
import { QuestionCard } from './QuestionCard'
import { QuizResult } from './QuizResult'
import { Button } from '@/components/ui/button'
import { useQuizSession } from '@/hooks/useQuizSession'
import type { Quiz } from '@/domain'

export function QuizSession({ quiz }: { quiz: Quiz }) {
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
      <div className="flex justify-end gap-2">
        {!revealed ? (
          <Button disabled={selected === null} onClick={reveal}>
            Valider
          </Button>
        ) : (
          <Button disabled={isSubmitting} onClick={next}>
            {currentIndex + 1 === total ? 'Terminer' : 'Suivant'}
          </Button>
        )}
      </div>
    </div>
  )
}
