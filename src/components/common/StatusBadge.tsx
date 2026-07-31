import { Badge } from '@/components/ui/badge'
import type { ChapterStatus } from '@/domain'

const STATUS_CONFIG: Record<ChapterStatus, { label: string; variant: 'green' | 'blue' | 'outline' }> = {
  completed: { label: 'Terminé', variant: 'green' },
  in_progress: { label: 'En cours', variant: 'blue' },
  not_started: { label: 'À faire', variant: 'outline' },
}

export function StatusBadge({ status }: { status: ChapterStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
