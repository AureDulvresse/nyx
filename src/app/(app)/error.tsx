'use client'

import { useEffect } from 'react'
import { Alert01Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[Nyx] Erreur applicative:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red/30 bg-red/5 px-6 py-16 text-center">
      <Alert01Icon size={40} className="text-red" />
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Une erreur est survenue</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Quelque chose s&apos;est mal passé en chargeant cette page. Réessaie, ou reviens plus tard.
        </p>
      </div>
      <Button onClick={() => unstable_retry()}>Réessayer</Button>
    </div>
  )
}
