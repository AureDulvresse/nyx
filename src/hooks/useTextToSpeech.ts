'use client'

import { useCallback, useRef, useState } from 'react'
import { splitTextForSpeech } from '@/lib/utils/speech.utils'

export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [needsManualPlay, setNeedsManualPlay] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const chunksRef = useRef<string[]>([])
  // speak() flips this to false; stop() flips it back — lets an in-flight fetch/callback from a
  // chunk that's already been abandoned notice and bail instead of starting playback anyway.
  const stoppedRef = useRef(true)

  const releaseCurrentUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
    audioRef.current?.pause()
    releaseCurrentUrl()
    chunksRef.current = []
    setIsLoading(false)
    setIsSpeaking(false)
    setNeedsManualPlay(false)
  }, [releaseCurrentUrl])

  // Split out from playNextChunk(): the fetch to Piper can take several seconds (a full chapter can
  // take ~20s on CPU across all its chunks), so by the time a blob is ready the browser's transient
  // user-activation from the original click has often expired — audio.play() then rejects with
  // NotAllowedError instead of actually being blocked forever. In that case we surface a manual
  // "▶ Lire" affordance instead of silently failing: a fresh click carries its own gesture, so
  // retryPlay() succeeds.
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

  // Consumes chunksRef one at a time: synthesize, play, and on audio.onended recurse into the next
  // one. This is what actually reads a full chapter — each Piper request stays small and bounded, so
  // a stall or truncation only drops one chunk instead of silently cutting the whole reading short.
  // Named as a function expression (not just assigned to the outer const) so the recursive call
  // inside audio.onended binds to the function's own name instead of the useCallback binding —
  // referencing the outer const here would be a TDZ hazard at declaration time.
  const playNextChunk = useCallback(async function playChunk() {
    if (stoppedRef.current || chunksRef.current.length === 0) {
      setIsSpeaking(false)
      setIsLoading(false)
      return
    }
    const text = chunksRef.current.shift()!
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (stoppedRef.current) return

      if (!response.ok) {
        setError('Synthèse vocale indisponible.')
        setIsLoading(false)
        setIsSpeaking(false)
        return
      }

      // Built explicitly with an ArrayBuffer + forced MIME type rather than response.blob()
      // directly: if the Content-Type header ever gets lost/altered on the way back (proxy,
      // dev server quirk...), an untyped/mistyped blob is exactly what makes <audio> report
      // "NotSupportedError: no supported source" even though the bytes themselves are fine.
      const bytes = await response.arrayBuffer()
      if (stoppedRef.current) return
      if (bytes.byteLength === 0) {
        setError('Piper a renvoyé un audio vide.')
        setIsLoading(false)
        setIsSpeaking(false)
        return
      }

      const blob = new Blob([bytes], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      releaseCurrentUrl()
      audioRef.current = audio
      urlRef.current = url

      audio.onended = () => {
        releaseCurrentUrl()
        playChunk()
      }
      // A truncated/corrupt blob (e.g. the response got cut short under heavy CPU load) often
      // doesn't fail at play() — it fails when the browser actually tries to decode the data.
      audio.onerror = () => {
        const mediaError = audio.error
        setError(
          mediaError ? `Lecture audio impossible (code ${mediaError.code}: ${mediaError.message}).` : 'Lecture audio impossible.'
        )
        setIsSpeaking(false)
      }
      setIsLoading(false)
      await playAudio(audio)
    } catch {
      setError('Synthèse vocale indisponible.')
      setIsLoading(false)
      setIsSpeaking(false)
    }
  }, [playAudio, releaseCurrentUrl])

  const speak = useCallback(
    async (text: string) => {
      setError(null)
      stop()
      stoppedRef.current = false
      chunksRef.current = splitTextForSpeech(text)
      await playNextChunk()
    },
    [stop, playNextChunk]
  )

  const retryPlay = useCallback(() => {
    if (audioRef.current) playAudio(audioRef.current)
  }, [playAudio])

  return { isLoading, isSpeaking, needsManualPlay, error, speak, stop, retryPlay }
}
