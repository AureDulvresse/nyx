'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { splitTextForSpeech } from '@/lib/utils/speech.utils'

export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'paused'

export interface TextToSpeechState {
  status: SpeechStatus
  /** Progression de la lecture, de 0 à 1 (morceaux déjà lus / total). */
  progress: number
  error: string | null
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

// Audio d'avance maximum avant de demander le morceau suivant : assez pour ne jamais créer de blanc,
// sans charger tout un chapitre décodé en mémoire.
const BUFFER_AHEAD_SECONDS = 25

async function synthesize(text: string, signal: AbortSignal): Promise<ArrayBuffer> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Synthèse vocale indisponible.')
  }
  return response.arrayBuffer()
}

// Lecture via Piper (voix neuronale locale) + Web Audio API : chaque morceau est programmé pour
// démarrer exactement à la fin du précédent (lecture continue, sans blanc), et le morceau suivant
// est synthétisé pendant que le précédent est lu.
export function useTextToSpeech(): TextToSpeechState {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback((): void => {
    abortRef.current?.abort()
    abortRef.current = null
    void ctxRef.current?.close().catch(() => undefined)
    ctxRef.current = null
    setStatus('idle')
    setProgress(0)
  }, [])

  useEffect(() => stop, [stop])

  const speak = useCallback(
    (text: string): void => {
      stop()
      setError(null)
      const chunks = splitTextForSpeech(text)
      if (chunks.length === 0) return

      // Créé dans le clic : le navigateur autorise alors la lecture audio sans autre geste.
      const ctx = new AudioContext()
      const controller = new AbortController()
      ctxRef.current = ctx
      abortRef.current = controller
      setStatus('loading')

      const run = async (): Promise<void> => {
        let nextStart = 0
        let played = 0
        // Le rejet d'une synthèse anticipée est traité quand on l'attend ; on évite juste le
        // « unhandled rejection » si la lecture est arrêtée avant.
        const prefetch = (index: number): Promise<ArrayBuffer> => {
          const p = synthesize(chunks[index], controller.signal)
          p.catch(() => undefined)
          return p
        }
        let pending = prefetch(0)

        for (let i = 0; i < chunks.length; i++) {
          const bytes = await pending
          // Lance la synthèse du morceau suivant pendant le décodage et la lecture de celui-ci.
          if (i + 1 < chunks.length) pending = prefetch(i + 1)
          const buffer = await ctx.decodeAudioData(bytes)
          if (controller.signal.aborted) return

          const source = ctx.createBufferSource()
          source.buffer = buffer
          source.connect(ctx.destination)
          const startAt = Math.max(nextStart, ctx.currentTime + 0.05)
          source.start(startAt)
          nextStart = startAt + buffer.duration
          source.onended = () => {
            if (controller.signal.aborted) return
            played++
            setProgress(played / chunks.length)
            if (played === chunks.length) stop()
          }
          if (i === 0) setStatus((s) => (s === 'loading' ? 'playing' : s))

          // N'avance pas trop : attend que le tampon audio redescende sous le seuil.
          while (nextStart - ctx.currentTime > BUFFER_AHEAD_SECONDS) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            if (controller.signal.aborted) return
          }
        }
      }

      run().catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Lecture audio impossible.')
        stop()
      })
    },
    [stop]
  )

  const pause = useCallback((): void => {
    const ctx = ctxRef.current
    if (!ctx) return
    void ctx.suspend().then(() => setStatus('paused'))
  }, [])

  const resume = useCallback((): void => {
    const ctx = ctxRef.current
    if (!ctx) return
    void ctx.resume().then(() => setStatus('playing'))
  }, [])

  return { status, progress, error, speak, pause, resume, stop }
}
