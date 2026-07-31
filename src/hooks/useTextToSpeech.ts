'use client'

import { useCallback, useRef, useState } from 'react'

export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setIsLoading(false)
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(
    async (text: string) => {
      setError(null)
      stop()
      setIsLoading(true)

      try {
        const response = await fetch('/api/assistant/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          setError('Synthèse vocale indisponible.')
          setIsLoading(false)
          return
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(url)
        }
        setIsLoading(false)
        setIsSpeaking(true)
        await audio.play()
      } catch {
        setError('Synthèse vocale indisponible.')
        setIsLoading(false)
        setIsSpeaking(false)
      }
    },
    [stop]
  )

  return { isLoading, isSpeaking, error, speak, stop }
}
