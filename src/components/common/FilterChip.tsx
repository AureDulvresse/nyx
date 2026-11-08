import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

const VARIANT_STYLES = {
  solid: {
    base: 'px-3 py-1.5',
    active: 'bg-violet-nyx text-white',
    inactive: 'bg-surface text-text-secondary hover:text-text-primary',
  },
  outline: {
    base: 'border px-3 py-1',
    active: 'border-violet-nyx text-purple',
    inactive: 'border-border text-text-secondary hover:text-text-primary',
  },
} as const

/** Toggleable pill used by the explorers' category/difficulty/status filter rows. */
export function FilterChip({
  active,
  onClick,
  variant = 'solid',
  className,
  children,
}: {
  active: boolean
  onClick: () => void
  variant?: keyof typeof VARIANT_STYLES
  className?: string
  children: ReactNode
}): React.JSX.Element {
  const styles = VARIANT_STYLES[variant]
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full text-xs font-medium transition-colors',
        styles.base,
        active ? styles.active : styles.inactive,
        className
      )}
    >
      {children}
    </button>
  )
}
