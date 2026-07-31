'use client'

import { HeadphonesIcon, VolumeOffIcon, Loading03Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'

export function ReadAloudButton({ text }: { text: string }) {
  const { isLoading, isSpeaking, error, speak, stop } = useTextToSpeech()

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isLoading}
        onClick={() => (isSpeaking ? stop() : speak(text))}
      >
        {isLoading ? (
          <>
            <Loading03Icon size={15} className="animate-spin" /> Génération de la voix...
          </>
        ) : isSpeaking ? (
          <>
            <VolumeOffIcon size={15} /> Arrêter la lecture
          </>
        ) : (
          <>
            <HeadphonesIcon size={15} /> Écouter ce chapitre
          </>
        )}
      </Button>
      {error && <span className="text-xs text-red">{error}</span>}
    </div>
  )
}
