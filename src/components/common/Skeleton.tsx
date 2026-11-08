import { cn } from '@/lib/utils/cn'

export function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return <div className={cn('animate-pulse rounded-md bg-border/60', className)} />
}
