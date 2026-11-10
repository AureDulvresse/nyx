'use client'

import { HeadphonesIcon, PauseIcon, PlayIcon, StopIcon, Loading03Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'

export function ReadAloudButton({ text }: { text: string }): React.JSX.Element {
  const { status, progress, error, speak, pause, resume, stop } = useTextToSpeech()
  const active = status !== 'idle'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!active && (
        <Button type="button" variant="secondary" size="sm" onClick={() => speak(text)}>
          <HeadphonesIcon size={15} aria-hidden /> Écouter ce chapitre
        </Button>
      )}

      {status === 'loading' && (
        <Button type="button" variant="secondary" size="sm" disabled>
          <Loading03Icon size={15} className="animate-spin" aria-hidden /> Préparation de la voix…
        </Button>
      )}

      {status === 'playing' && (
        <Button type="button" variant="secondary" size="sm" onClick={pause}>
          <PauseIcon size={15} aria-hidden /> Pause
        </Button>
      )}

      {status === 'paused' && (
        <Button type="button" variant="secondary" size="sm" onClick={resume}>
          <PlayIcon size={15} aria-hidden /> Reprendre
        </Button>
      )}

      {active && (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={stop} aria-label="Arrêter la lecture">
            <StopIcon size={15} aria-hidden />
          </Button>
          <div
            className="h-1.5 w-24 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-label="Progression de la lecture"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div className="h-full bg-violet-nyx transition-[width] duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </>
      )}

      {error && (
        <span className="text-xs text-red" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
