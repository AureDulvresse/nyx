'use client'

import { useState } from 'react'
import { Clock01Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { ExamQuestionCard } from './ExamQuestionCard'
import { ExamNav } from './ExamNav'
import { ExamResult } from './ExamResult'
import { useExamSession, formatRemaining } from '@/hooks/useExamSession'
import { cn } from '@/lib/utils/cn'
import type { CourseExam } from '@/domain'

export function ExamSession({ exam, courseSlug }: { exam: CourseExam; courseSlug: string }) {
  const {
    currentIndex,
    currentQuestion,
    total,
    answersByQuestion,
    answeredCount,
    remainingSeconds,
    result,
    isSubmitting,
    select,
    goTo,
    submit,
    restart,
  } = useExamSession(exam)

  const [key, setKey] = useState(0)
  const lowTime = remainingSeconds <= 60

  if (result) {
    return (
      <ExamResult
        result={result}
        passingPercentage={exam.passingPercentage}
        courseSlug={courseSlug}
        onRetry={() => {
          restart()
          setKey((k) => k + 1)
        }}
      />
    )
  }

  return (
    <div key={key} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ExamNav
          questions={exam.questions}
          currentIndex={currentIndex}
          answersByQuestion={answersByQuestion}
          onGoTo={goTo}
        />
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
            lowTime ? 'bg-red/15 text-red' : 'bg-teal/15 text-teal'
          )}
        >
          <Clock01Icon size={15} />
          {formatRemaining(remainingSeconds)}
        </div>
      </div>

      <ExamQuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={total}
        selected={answersByQuestion[currentQuestion.id]}
        onSelect={select}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="secondary" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>
            Précédent
          </Button>
          <Button variant="secondary" disabled={currentIndex + 1 === total} onClick={() => goTo(currentIndex + 1)}>
            Suivant
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">
            {answeredCount} / {total} répondues
          </span>
          <Button disabled={isSubmitting} onClick={submit}>
            Terminer l'examen
          </Button>
        </div>
      </div>
    </div>
  )
}
