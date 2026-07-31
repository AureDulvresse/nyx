import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-violet-nyx/15 text-purple',
      green: 'bg-green/15 text-green',
      blue: 'bg-blue/15 text-blue',
      red: 'bg-red/15 text-red',
      orange: 'bg-orange/15 text-orange',
      teal: 'bg-teal/15 text-teal',
      outline: 'border border-border text-text-secondary',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
