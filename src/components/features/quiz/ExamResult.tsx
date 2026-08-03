import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/common/ProgressRing'
import { Button } from '@/components/ui/button'
import type { ExamAttemptResult } from '@/domain'

export function ExamResult({
  result,
  passingPercentage,
  courseSlug,
  onRetry,
}: {
  result: ExamAttemptResult
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
