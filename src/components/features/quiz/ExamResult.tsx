import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/common/ProgressRing'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ExamAttemptResult, QuizQuestion } from '@/domain'

function correctIndices(question: QuizQuestion): number[] {
  return Array.isArray(question.correct) ? question.correct : [question.correct]
}

// Weak-topic breakdown for a failed attempt: which tags had at least one wrong answer, and how
// many. No question-by-question reveal here on purpose — see the WeakTopics vs QuestionReview
// split below.
function WeakTopics({ result, questions }: { result: ExamAttemptResult; questions: QuizQuestion[] }) {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const wrongByTag = new Map<string, number>()

  for (const a of result.answers) {
    if (a.correct) continue
    const question = byId.get(a.questionId)
    for (const tag of question?.tags ?? []) {
      wrongByTag.set(tag, (wrongByTag.get(tag) ?? 0) + 1)
    }
  }

  const sortedTags = Array.from(wrongByTag.entries()).sort((a, b) => b[1] - a[1])
  if (sortedTags.length === 0) return null

  return (
    <div className="w-full text-left">
      <p className="mb-2 text-sm font-medium text-text-primary">Thèmes à retravailler</p>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map(([tag, count]) => (
          <Badge key={tag} variant="outline">
            {tag} ({count})
          </Badge>
        ))}
      </div>
    </div>
  )
}

// Full per-question breakdown — only ever rendered for a PASSED attempt (see ExamResult below).
// Revealing exact right/wrong answers on a FAILED attempt would let someone grind pass-fail-retry
// cycles into free answer-key lookups instead of actually re-studying the material.
function QuestionReview({ result, questions }: { result: ExamAttemptResult; questions: QuizQuestion[] }) {
  const byId = new Map(questions.map((q) => [q.id, q]))

  return (
    <div className="w-full space-y-3 text-left">
      <p className="text-sm font-medium text-text-primary">Revue des questions</p>
      {result.answers.map((a, i) => {
        const question = byId.get(a.questionId)
        if (!question) return null
        const correct = correctIndices(question)

        return (
          <Card key={a.questionId} className="p-4">
            <p className="mb-2 text-sm font-medium text-text-primary">
              {i + 1}. {question.question}
            </p>
            <div className="space-y-1.5">
              {question.options.map((option, idx) => {
                const wasChosen = a.chosen.includes(idx)
                const isCorrect = correct.includes(idx)
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
            <p className="mt-2 text-xs text-text-secondary">{question.explanation}</p>
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
  result: ExamAttemptResult
  questions: QuizQuestion[]
  passingPercentage: number
  courseSlug: string
  onRetry: () => void
}) {
  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <ProgressRing percentage={result.percentage} size={110} color={result.passed ? 'var(--green)' : 'var(--red)'} />
      <div>
        <h3 className="text-xl font-bold text-text-primary">
          {result.passed ? 'Examen réussi — félicitations !' : 'Examen échoué'}
        </h3>
        <p className="mt-1 text-text-secondary">
          {result.score} / {result.total} bonnes réponses ({result.percentage}%) en {Math.floor(result.duration / 60)}min
          {result.duration % 60}s
        </p>
        <p className="mt-1 text-sm text-text-secondary">Seuil de réussite : {passingPercentage}%</p>
      </div>

      {result.passed ? (
        <QuestionReview result={result} questions={questions} />
      ) : (
        <WeakTopics result={result} questions={questions} />
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onRetry}>
          Repasser l'examen
        </Button>
        <Link href={`/courses/${courseSlug}`}>
          <Button>Retour au cours</Button>
        </Link>
      </div>
    </Card>
  )
}
