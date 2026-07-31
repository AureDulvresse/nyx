import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/common/ProgressRing'
import { Button } from '@/components/ui/button'
import type { QuizAttemptResult } from '@/domain'

export function QuizResult({ result, onRetry }: { result: QuizAttemptResult; onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <ProgressRing
        percentage={result.percentage}
        size={100}
        color={result.passed ? 'var(--green)' : 'var(--red)'}
      />
      <div>
        <h3 className="text-xl font-bold text-text-primary">
          {result.passed ? 'Quiz réussi !' : 'Quiz échoué'}
        </h3>
        <p className="mt-1 text-text-secondary">
          {result.score} / {result.total} bonnes réponses en {result.duration}s
        </p>
      </div>
      <Button onClick={onRetry}>Recommencer</Button>
    </Card>
  )
}
