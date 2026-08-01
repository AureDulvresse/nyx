'use client'

import { useState } from 'react'
import { HeadphonesIcon, VolumeOffIcon, PlayCircleIcon, Loading03Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { ConfirmActivationModal } from './ConfirmActivationModal'

export function ReadAloudButton({ text }: { text: string }) {
  const { isLoading, isSpeaking, needsManualPlay, error, speak, stop, retryPlay } = useTextToSpeech()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleClick = () => {
    if (needsManualPlay) {
      retryPlay()
    } else if (isSpeaking) {
      stop()
    } else {
      setConfirmOpen(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" size="sm" disabled={isLoading} onClick={handleClick}>
        {isLoading ? (
          <>
            <Loading03Icon size={15} className="animate-spin" /> Génération de la voix...
          </>
        ) : needsManualPlay ? (
          <>
            <PlayCircleIcon size={15} /> Lancer la lecture
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

      {confirmOpen && (
        <ConfirmActivationModal
          title="Activer la lecture audio ?"
          description="Ask Nyx va lire ce chapitre à voix haute via la synthèse vocale locale (Piper). Ça peut prendre quelques secondes à générer selon la longueur du chapitre."
          onConfirm={() => {
            setConfirmOpen(false)
            speak(text)
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  )
}
