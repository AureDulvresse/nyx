import { StarIcon } from 'hugeicons-react'

export function PointsBadge({ points }: { points: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-purple/15 px-3 py-1.5 text-sm font-medium text-purple">
      <StarIcon size={16} />
      <span>{points} pts</span>
    </div>
  )
}
