'use client'

import { useCallback, useState } from 'react'
import { Clock01Icon, FullScreenIcon, MinimizeScreenIcon, Flag03Icon, LockIcon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { Terminal } from '@/components/features/terminal/Terminal'
import { CommandJournal } from '@/components/features/terminal/CommandJournal'
import { FlagForm } from './FlagForm'
import { useLabSession } from '@/hooks/useLabSession'
import { useLabTimer, formatElapsed } from '@/hooks/useLabTimer'
import { cn } from '@/lib/utils/cn'
import type { FlagSubmitResult, Lab } from '@/domain'

export function LabMission({ lab }: { lab: Lab }) {
  const { state, session, wsUrl, error, isPending, startLab, stopLab, submitFlag } = useLabSession(lab.id)
  const elapsedSeconds = useLabTimer(state === 'active')
  const estimatedSeconds = lab.estimatedTime * 60
  const overEstimate = elapsedSeconds > estimatedSeconds
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [capturedFlagIds, setCapturedFlagIds] = useState<Set<string>>(new Set())
  const totalFlags = lab.flags?.length ?? 0

  const handleFlagSubmit = useCallback(
    async (flag: string): Promise<FlagSubmitResult> => {
      const result = await submitFlag(flag, elapsedSeconds)
      if (result.success && result.flagId) {
        setCapturedFlagIds((prev) => new Set(prev).add(result.flagId!))
      }
      return result
    },
    [submitFlag, elapsedSeconds]
  )

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
        <p className="text-text-secondary">Lance ton environnement Kali + cibles pour démarrer la mission.</p>
        {error && <p className="text-sm text-red">{error}</p>}
        <Button disabled={isPending} onClick={startLab}>
          Démarrer le lab
        </Button>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="rounded-lg border border-border bg-surface p-10 text-center text-text-secondary">
        Provisionnement de l'environnement Docker... <span className="text-xs">(le chrono estimé ne démarre qu'une fois le terminal connecté)</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
            state === 'completed' ? 'bg-green/15 text-green' : overEstimate ? 'bg-orange/15 text-orange' : 'bg-teal/15 text-teal'
          )}
        >
          <Clock01Icon size={15} />
          {formatElapsed(elapsedSeconds)} / {lab.estimatedTime} min estimées
        </div>
        {totalFlags > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-violet-nyx/15 px-3 py-1 text-sm font-medium text-purple">
            <Flag03Icon size={15} />
            {capturedFlagIds.size} / {totalFlags} flags capturés
          </div>
        )}
      </div>

      <div className={cn('grid gap-4', isFullscreen ? 'fixed inset-0 z-50 grid-cols-1 bg-background p-4' : 'lg:grid-cols-[1fr_260px]')}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="absolute right-2 top-2 z-10 rounded-md bg-surface/80 p-1.5 text-text-secondary hover:text-text-primary"
            aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <MinimizeScreenIcon size={16} /> : <FullScreenIcon size={16} />}
          </button>
          <div className={isFullscreen ? 'h-full' : 'h-[420px]'}>
            <Terminal wsUrl={wsUrl} />
          </div>
        </div>

        {!isFullscreen && totalFlags > 0 && (
          <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Flags</h4>
            {lab.flags?.map((flag) => {
              const captured = capturedFlagIds.has(flag.flagId)
              return (
                <div
                  key={flag.id}
                  className={cn(
                    'flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs',
                    captured ? 'border-green/40 bg-green/10 text-green' : 'border-border text-text-secondary'
                  )}
                >
                  {captured ? <Flag03Icon size={14} className="mt-0.5 shrink-0" /> : <LockIcon size={14} className="mt-0.5 shrink-0" />}
                  <div>
                    <p className="font-medium">{captured ? flag.flagId : `${flag.flagId} — verrouillé`}</p>
                    <p className="mt-0.5">{captured ? `+${flag.points} pts` : flag.hint}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {session && <CommandJournal sessionId={session.id} />}
      <FlagForm onSubmit={handleFlagSubmit} />
      {state === 'completed' ? (
        <div className="rounded-lg border border-green/40 bg-green/10 p-4 text-center text-green">
          Mission terminée — bravo !
        </div>
      ) : (
        <Button variant="secondary" disabled={isPending} onClick={stopLab}>
          Arrêter la session
        </Button>
      )}
    </div>
  )
}
