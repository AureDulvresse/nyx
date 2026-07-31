import { FireIcon } from 'hugeicons-react'

export function StreakBadge({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange/15 px-3 py-1.5 text-sm font-medium text-orange">
      <FireIcon size={16} />
      <span>{days} jour{days > 1 ? 's' : ''}</span>
    </div>
  )
}
