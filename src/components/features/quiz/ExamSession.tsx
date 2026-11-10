'use client'

import { Clock01Icon, Task01Icon, Target02Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExamQuestionCard } from './ExamQuestionCard'
import { ExamNav } from './ExamNav'
import { ExamResult } from './ExamResult'
import { useExamSession } from '@/hooks/useExamSession'
import { formatDuration } from '@/lib/utils/date.utils'
import { cn } from '@/lib/utils/cn'
import type { CourseExamSummary } from '@/domain'

function ExamIntro({
  exam,
  error,
  isPending,
  onStart,
}: {
  exam: CourseExamSummary
  error: string | null
  isPending: boolean
  onStart: () => void
}): React.JSX.Element {
  return (
    <Card className="space-y-5 p-6">
      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="flex items-center gap-2 text-sm text-text-secondary">
          <Task01Icon size={18} className="text-purple" aria-hidden />
          {exam.questionCount} questions tirées parmi {exam.bankSize}
        </li>
        <li className="flex items-center gap-2 text-sm text-text-secondary">
          <Clock01Icon size={18} className="text-teal" aria-hidden />
          {Math.round(exam.durationSeconds / 60)} minutes
        </li>
        <li className="flex items-center gap-2 text-sm text-text-secondary">
          <Target02Icon size={18} className="text-green" aria-hidden />
          {exam.passingPercentage}% pour réussir
        </li>
      </ul>
      <p className="text-sm text-text-secondary">
        Conditions d&apos;examen : aucune correction pendant l&apos;épreuve, le chrono démarre au clic et la copie est
        envoyée automatiquement à la fin du temps. Certaines questions acceptent plusieurs réponses.
      </p>
      {error && (
        <p className="text-sm text-red" role="alert">
          {error}
        </p>
      )}
      <Button onClick={onStart} disabled={isPending}>
        {isPending ? 'Préparation…' : 'Commencer l’examen'}
      </Button>
    </Card>
  )
}

export function ExamSession({ exam, courseSlug }: { exam: CourseExamSummary; courseSlug: string }): React.JSX.Element {
  const {
    phase,
    questions,
    currentIndex,
    currentQuestion,
    total,
    answersByQuestion,
    answeredCount,
    remainingSeconds,
    result,
    error,
    isPending,
    start,
    select,
    goTo,
    submit,
    restart,
  } = useExamSession(exam)

  if (phase === 'done' && result) {
    return (
      <ExamResult
        result={result}
        questions={questions}
        passingPercentage={exam.passingPercentage}
        courseSlug={courseSlug}
        onRetry={restart}
      />
    )
  }

  if (phase === 'intro' || !currentQuestion) {
    return <ExamIntro exam={exam} error={error} isPending={isPending} onStart={start} />
  }

  const lowTime = remainingSeconds <= 60
  const unanswered = total - answeredCount

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ExamNav questions={questions} currentIndex={currentIndex} answersByQuestion={answersByQuestion} onGoTo={goTo} />
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
            lowTime ? 'bg-red/15 text-red' : 'bg-teal/15 text-teal'
          )}
          role="timer"
          aria-label="Temps restant"
        >
          <Clock01Icon size={15} aria-hidden />
          {formatDuration(remainingSeconds)}
        </div>
      </div>

      <ExamQuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={total}
        selected={answersByQuestion[currentQuestion.id] ?? []}
        onSelect={select}
      />

      {error && (
        <p className="text-sm text-red" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
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
          <Button
            disabled={isPending}
            onClick={() => {
              if (unanswered > 0 && !window.confirm(`${unanswered} question(s) sans réponse. Terminer quand même ?`)) return
              submit()
            }}
          >
            Terminer l&apos;examen
          </Button>
        </div>
      </div>
    </div>
  )
}
