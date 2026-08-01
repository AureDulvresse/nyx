'use client'

import { useCallback, useRef, useState } from 'react'

export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [needsManualPlay, setNeedsManualPlay] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setIsLoading(false)
    setIsSpeaking(false)
    setNeedsManualPlay(false)
  }, [])

  // Split out from speak(): the fetch to Piper can take several seconds (a full chapter can take
  // ~20s on CPU), so by the time the blob is ready the browser's transient user-activation from
  // the original click has often expired — audio.play() then rejects with NotAllowedError instead
  // of actually being blocked forever. In that case we surface a manual "▶ Lire" affordance instead
  // of silently failing: a fresh click carries its own gesture, so retryPlay() succeeds.
  const playAudio = useCallback(async (audio: HTMLAudioElement) => {
    try {
      await audio.play()
      setIsSpeaking(true)
      setNeedsManualPlay(false)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        setNeedsManualPlay(true)
        setIsSpeaking(false)
      } else {
        // Surface the real reason (e.g. a decode error from a response that got cut short under
        // heavy CPU load) instead of a generic message — makes this actually diagnosable next time.
        const reason = e instanceof DOMException ? `${e.name}: ${e.message}` : String(e)
        setError(`Lecture audio impossible (${reason}).`)
        setIsSpeaking(false)
      }
    }
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

        // Built explicitly with an ArrayBuffer + forced MIME type rather than response.blob()
        // directly: if the Content-Type header ever gets lost/altered on the way back (proxy,
        // dev server quirk...), an untyped/mistyped blob is exactly what makes <audio> report
        // "NotSupportedError: no supported source" even though the bytes themselves are fine.
        const bytes = await response.arrayBuffer()
        if (bytes.byteLength === 0) {
          setError('Piper a renvoyé un audio vide.')
          setIsLoading(false)
          return
        }
        const blob = new Blob([bytes], { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(url)
        }
        // A truncated/corrupt blob (e.g. the response got cut short under heavy CPU load) often
        // doesn't fail at play() — it fails when the browser actually tries to decode the data.
        audio.onerror = () => {
          const mediaError = audio.error
          setError(
            mediaError ? `Lecture audio impossible (code ${mediaError.code}: ${mediaError.message}).` : 'Lecture audio impossible.'
          )
          setIsSpeaking(false)
          URL.revokeObjectURL(url)
        }
        setIsLoading(false)
        await playAudio(audio)
      } catch {
        setError('Synthèse vocale indisponible.')
        setIsLoading(false)
        setIsSpeaking(false)
      }
    },
    [stop, playAudio]
  )

  const retryPlay = useCallback(() => {
    if (audioRef.current) playAudio(audioRef.current)
  }, [playAudio])

  return { isLoading, isSpeaking, needsManualPlay, error, speak, stop, retryPlay }
}
