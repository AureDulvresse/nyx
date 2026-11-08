import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_LABELS } from '@/lib/constants'

const DIFFICULTY_VARIANT: Record<string, 'green' | 'orange' | 'red'> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
}

/** Shared beginner/intermediate/advanced badge for chapters and labs. */
export function DifficultyBadge({ difficulty }: { difficulty: string }): React.JSX.Element {
  return (
    <Badge variant={DIFFICULTY_VARIANT[difficulty] ?? 'outline'}>
      {DIFFICULTY_LABELS[difficulty] ?? difficulty}
    </Badge>
  )
}
