'use client'

import { ComputerTerminal01Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { Terminal } from '@/components/features/terminal/Terminal'
import { CommandJournal } from '@/components/features/terminal/CommandJournal'
import { useTPSession } from '@/hooks/useTPSession'

export function TPShell({ tpId }: { tpId: string }) {
  const { state, sessionId, wsUrl, error, isPending, startShell, stopShell } = useTPSession(tpId)

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center">
        <ComputerTerminal01Icon size={28} className="text-text-secondary" />
        <p className="text-text-secondary">Lance un terminal Kali pour exécuter les étapes directement.</p>
        {error && <p className="text-sm text-red">{error}</p>}
        <Button disabled={isPending} onClick={startShell}>
          Lancer le terminal
        </Button>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-text-secondary">
        Provisionnement du terminal Kali...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="h-[380px]">
        <Terminal wsUrl={wsUrl} />
      </div>
      {sessionId && <CommandJournal sessionId={sessionId} />}
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" disabled={isPending} onClick={stopShell}>
          Arrêter le terminal
        </Button>
      </div>
    </div>
  )
}
