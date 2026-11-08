'use client'

import { useState } from 'react'
import { HeadphonesIcon, VolumeOffIcon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { ConfirmActivationModal } from './ConfirmActivationModal'

export function ReadAloudButton({ text }: { text: string }): React.JSX.Element {
  const { isSpeaking, error, speak, stop } = useTextToSpeech()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleClick = () => {
    if (isSpeaking) {
      stop()
    } else {
      setConfirmOpen(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={handleClick}>
        {isSpeaking ? (
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
          description="Le chapitre va être lu à voix haute avec la synthèse vocale de ton navigateur."
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
