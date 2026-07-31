'use client'

import { useState, useTransition } from 'react'
import { CheckmarkCircle02Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { completeTP } from '@/actions'

export function TPCompleteButton({ tpId, initiallyCompleted }: { tpId: string; initiallyCompleted: boolean }) {
  const [completed, setCompleted] = useState(initiallyCompleted)
  const [isPending, startTransition] = useTransition()

  if (completed) {
    return (
      <span className="flex items-center gap-1.5 text-sm font-medium text-green">
        <CheckmarkCircle02Icon size={18} /> Terminé
      </span>
    )
  }

  return (
    <Button
      variant="success"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await completeTP({ tpId })
          if (res.success) setCompleted(true)
        })
      }
    >
      Marquer terminé
    </Button>
  )
}
