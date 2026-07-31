'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { FlagSubmitResult } from '@/domain'

export function FlagForm({ onSubmit }: { onSubmit: (flag: string) => Promise<FlagSubmitResult> }) {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    startTransition(async () => {
      const result = await onSubmit(value.trim())
      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.labCompleted
            ? `Lab terminé ! Score final : ${result.totalScore}${result.bonusPoints ? ` (dont +${result.bonusPoints} bonus rapidité)` : ''}`
            : `+${result.points} points`,
        })
        setValue('')
      } else {
        setFeedback({ type: 'error', message: 'Flag incorrect ou déjà capturé.' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="FLAG{...}"
          className="font-mono"
        />
        <Button type="submit" disabled={isPending}>
          Soumettre
        </Button>
      </div>
      {feedback && (
        <p className={feedback.type === 'success' ? 'text-sm text-green' : 'text-sm text-red'}>{feedback.message}</p>
      )}
    </form>
  )
}
