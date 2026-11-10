import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/common/ProgressRing'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ExamQuestionPublic, ExamSubmission } from '@/domain'

// Weak-topic breakdown for a failed attempt: which tags had wrong answers, and how many. No
// question-by-question reveal on failure — see QuestionReview below.
function WeakTopics({ weakTags }: { weakTags: ExamSubmission['weakTags'] }): React.JSX.Element | null {
  if (weakTags.length === 0) return null
  return (
    <div className="w-full text-left">
      <p className="mb-2 text-sm font-medium text-text-primary">Thèmes à retravailler</p>
      <div className="flex flex-wrap gap-2">
        {weakTags.map(({ tag, count }) => (
          <Badge key={tag} variant="outline">
            {tag} ({count})
          </Badge>
        ))}
      </div>
    </div>
  )
}

// Full per-question correction — the server only sends it for a PASSED attempt, so failing
// repeatedly can't be used as a free answer-key lookup instead of re-studying the material.
function QuestionReview({
  review,
  questions,
}: {
  review: NonNullable<ExamSubmission['review']>
  questions: ExamQuestionPublic[]
}): React.JSX.Element {
  const byId = new Map(questions.map((q) => [q.id, q]))

  return (
    <div className="w-full space-y-3 text-left">
      <p className="text-sm font-medium text-text-primary">Revue des questions</p>
      {review.map((item, i) => {
        const question = byId.get(item.questionId)
        if (!question) return null
        return (
          <Card key={item.questionId} className="p-4">
            <p className="mb-2 text-sm font-medium text-text-primary">
              {i + 1}. {question.question}
            </p>
            <div className="space-y-1.5">
              {question.options.map((option, idx) => {
                const wasChosen = item.chosen.includes(idx)
                const isCorrect = item.correctOptions.includes(idx)
                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm',
                      isCorrect
                        ? 'border-green/40 bg-green/10 text-green'
                        : wasChosen
                          ? 'border-red/40 bg-red/10 text-red'
                          : 'border-border text-text-secondary'
                    )}
                  >
                    {option}
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-text-secondary">{item.explanation}</p>
          </Card>
        )
      })}
    </div>
  )
}

export function ExamResult({
  result,
  questions,
  passingPercentage,
  courseSlug,
  onRetry,
}: {
  result: ExamSubmission
  questions: ExamQuestionPublic[]
  passingPercentage: number
  courseSlug: string
  onRetry: () => void
}): React.JSX.Element {
  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <ProgressRing percentage={result.percentage} size={110} color={result.passed ? 'var(--green)' : 'var(--red)'} />
      <div aria-live="polite">
        <h3 className="text-xl font-bold text-text-primary">
          {result.passed ? 'Examen réussi — félicitations !' : 'Examen échoué'}
        </h3>
        <p className="mt-1 text-text-secondary">
          {result.score} / {result.total} bonnes réponses ({result.percentage}%) en {Math.floor(result.duration / 60)} min{' '}
          {String(result.duration % 60).padStart(2, '0')} s
        </p>
        <p className="mt-1 text-sm text-text-secondary">Seuil de réussite : {passingPercentage}%</p>
      </div>

      {result.review ? <QuestionReview review={result.review} questions={questions} /> : <WeakTopics weakTags={result.weakTags} />}

      <div className="flex gap-2">
        {!result.passed && (
          <Button variant="secondary" onClick={onRetry}>
            Repasser l&apos;examen
          </Button>
        )}
        <Link href={`/courses/${courseSlug}`}>
          <Button>Retour au cours</Button>
        </Link>
      </div>
    </Card>
  )
}
