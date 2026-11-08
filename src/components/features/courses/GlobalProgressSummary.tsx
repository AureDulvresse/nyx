import { ProgressRing } from '@/components/common/ProgressRing'

export function GlobalProgressSummary({
  completed,
  total,
  percentage,
}: {
  completed: number
  total: number
  percentage: number
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <ProgressRing percentage={percentage} size={48} strokeWidth={4} />
      <div className="text-sm">
        <p className="font-medium text-text-primary">
          {completed}/{total}
        </p>
        <p className="text-text-secondary">chapitres</p>
      </div>
    </div>
  )
}
