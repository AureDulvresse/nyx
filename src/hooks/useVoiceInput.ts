'use client'

import { useCallback, useRef, useState } from 'react'

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      setError("Impossible d'accéder au micro — vérifie les permissions du navigateur.")
    }
  }, [])

  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }

      recorder.onstop = async () => {
        recorder.stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        setIsTranscribing(true)

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('audio', blob, 'recording.webm')

        try {
          const response = await fetch('/api/assistant/transcribe', { method: 'POST', body: form })
          const data = await response.json()
          setIsTranscribing(false)

          if (!response.ok) {
            setError(data.error ?? 'Transcription impossible.')
            resolve(null)
            return
          }
          resolve(data.text ?? '')
        } catch {
          setIsTranscribing(false)
          setError('Transcription impossible.')
          resolve(null)
        }
      }

      recorder.stop()
    })
  }, [])

  return { isRecording, isTranscribing, error, startRecording, stopRecording }
}
