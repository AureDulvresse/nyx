import { cn } from '@/lib/utils/cn'

export function Progress({
  value,
  className,
  colorClassName = 'bg-violet-nyx',
  color,
}: {
  value: number
  className?: string
  colorClassName?: string
  /** Arbitrary hex/rgb color, for per-course tinting where a Tailwind class can't express it. */
  color?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-border', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', !color && colorClassName)}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
