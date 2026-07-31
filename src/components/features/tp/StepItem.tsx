'use client'

import { useTransition } from 'react'
import { CheckmarkSquare02Icon, SquareIcon } from 'hugeicons-react'
import { updateTPStep } from '@/actions'
import { cn } from '@/lib/utils/cn'
import type { TPStep } from '@/domain'

export function StepItem({ tpId, step, index }: { tpId: string; step: TPStep; index: number }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await updateTPStep({ tpId, stepIndex: index, completed: !step.completed })
    })
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={step.completed ? 'Marquer comme non fait' : 'Valider cette étape'}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors disabled:opacity-50',
          step.completed ? 'bg-green text-[#0d1117]' : 'bg-background text-text-secondary border border-border hover:border-violet-nyx/50'
        )}
      >
        {step.completed ? <CheckmarkSquare02Icon size={15} /> : index + 1}
      </button>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <p className={cn('font-medium', step.completed ? 'text-text-secondary line-through' : 'text-text-primary')}>{step.title}</p>
        </div>
        <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
        {step.code && (
          <pre className="mt-2 overflow-x-auto rounded-md bg-background border border-border p-3 text-sm text-green">
            <code>{step.code}</code>
          </pre>
        )}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-teal disabled:opacity-50"
        >
          {step.completed ? <CheckmarkSquare02Icon size={14} className="text-teal" /> : <SquareIcon size={14} />}
          {step.completed ? 'Étape validée' : 'Valider cette étape'}
        </button>
      </div>
    </div>
  )
}
