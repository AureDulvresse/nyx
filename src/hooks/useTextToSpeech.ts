'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { splitTextForSpeech } from '@/lib/utils/speech.utils'

// Synthèse vocale native du navigateur (Web Speech API) — aucun service serveur requis.
// Le texte est découpé en morceaux enchaînés : certains navigateurs (Chrome) coupent
// silencieusement les énoncés trop longs au bout d'une quinzaine de secondes.
function pickFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang === 'fr-FR') ?? voices.find((v) => v.lang.startsWith('fr')) ?? null
}

export interface TextToSpeechState {
  isSpeaking: boolean
  error: string | null
  speak: (text: string) => void
  stop: () => void
}

export function useTextToSpeech(): TextToSpeechState {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chunksRef = useRef<string[]>([])
  const stoppedRef = useRef(true)

  const stop = useCallback((): void => {
    stoppedRef.current = true
    chunksRef.current = []
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  useEffect(() => stop, [stop])

  const playNextChunk = useCallback(function playChunk(): void {
    const text = chunksRef.current.shift()
    if (stoppedRef.current || !text) {
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    const voice = pickFrenchVoice()
    if (voice) utterance.voice = voice
    utterance.onend = () => playChunk()
    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return
      setError(`Lecture audio impossible (${e.error}).`)
      setIsSpeaking(false)
    }
    window.speechSynthesis.speak(utterance)
  }, [])

  const speak = useCallback(
    (text: string): void => {
      setError(null)
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setError('Synthèse vocale non supportée par ce navigateur.')
        return
      }
      stop()
      stoppedRef.current = false
      chunksRef.current = splitTextForSpeech(text)
      setIsSpeaking(true)
      playNextChunk()
    },
    [stop, playNextChunk]
  )

  return { isSpeaking, error, speak, stop }
}
