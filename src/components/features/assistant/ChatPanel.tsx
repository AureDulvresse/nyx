'use client'

import { useEffect, useRef, useState } from 'react'
import {
  SentIcon,
  Mic01Icon,
  MicOff01Icon,
  VolumeHighIcon,
  VolumeOffIcon,
  PlayCircleIcon,
  Loading03Icon,
} from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAskNyx } from '@/hooks/useAskNyx'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { cn } from '@/lib/utils/cn'
import { ConfirmActivationModal } from './ConfirmActivationModal'

type PendingConfirm = { kind: 'mic' } | { kind: 'speak'; content: string }

export function ChatPanel() {
  const { messages, isPending, error, sendMessage, context } = useAskNyx()
  const { isRecording, isTranscribing, error: voiceError, startRecording, stopRecording } = useVoiceInput()
  const { isSpeaking, needsManualPlay, speak, stop: stopSpeaking, retryPlay } = useTextToSpeech()
  const [input, setInput] = useState('')
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)
  const [longWait, setLongWait] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Ollama can take a couple of minutes to load the model into RAM the first time it's used
  // after being idle — without this, a slow first reply looks indistinguishable from "broken",
  // and closing/retrying mid-load actually cancels that load and restarts it from zero.
  useEffect(() => {
    if (!isPending) {
      setLongWait(false)
      return
    }
    const timer = setTimeout(() => setLongWait(true), 8000)
    return () => clearTimeout(timer)
  }, [isPending])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isPending])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || isPending) return
    setInput('')
    await sendMessage(content)
  }

  const handleMicClick = async () => {
    if (isRecording) {
      const text = await stopRecording()
      if (text) setInput((prev) => (prev ? `${prev} ${text}` : text))
    } else {
      setPendingConfirm({ kind: 'mic' })
    }
  }

  const handleSpeakClick = (content: string) => {
    if (needsManualPlay) {
      retryPlay()
    } else if (isSpeaking) {
      stopSpeaking()
    } else {
      setPendingConfirm({ kind: 'speak', content })
    }
  }

  const confirmActivation = async () => {
    if (!pendingConfirm) return
    if (pendingConfirm.kind === 'mic') {
      await startRecording()
    } else {
      await speak(pendingConfirm.content)
    }
    setPendingConfirm(null)
  }

  return (
    <div className="flex h-[480px] w-[360px] flex-col rounded-lg border border-border bg-background shadow-xl">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">Ask Nyx</p>
        {context && <p className="mt-0.5 truncate text-xs text-text-secondary">Contexte : {context.title}</p>}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-text-secondary">
            Pose une question sur {context ? `« ${context.title} »` : 'un cours, un lab ou une commande'} — Ask Nyx
            tourne entièrement en local (Ollama, aucun appel externe).
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
                m.role === 'user' ? 'bg-violet-nyx text-white' : 'bg-surface text-text-primary'
              )}
            >
              {m.content}
              {m.role === 'assistant' && (
                <button
                  onClick={() => handleSpeakClick(m.content)}
                  className="ml-2 inline-flex align-middle text-text-secondary hover:text-purple"
                  aria-label={needsManualPlay ? 'Lancer la lecture' : 'Écouter la réponse'}
                  title={needsManualPlay ? 'Lecture bloquée par le navigateur — clique pour lancer' : undefined}
                >
                  {needsManualPlay ? (
                    <PlayCircleIcon size={14} className="text-purple" />
                  ) : isSpeaking ? (
                    <VolumeOffIcon size={14} />
                  ) : (
                    <VolumeHighIcon size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="space-y-1 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Loading03Icon size={14} className="animate-spin" /> Ask Nyx réfléchit...
            </div>
            {longWait && (
              <p className="text-xs italic">
                Premier message après une pause : le modèle se recharge en mémoire, ça peut prendre 1 à 3 minutes.
                Patiente plutôt que de fermer/réessayer — ça repartirait de zéro.
              </p>
            )}
          </div>
        )}
        {(error || voiceError) && <p className="text-sm text-red">{error ?? voiceError}</p>}
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={isTranscribing ? 'Transcription en cours...' : 'Écris ou parle à Ask Nyx...'}
          disabled={isTranscribing}
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="icon"
            variant={isRecording ? 'destructive' : 'secondary'}
            onClick={handleMicClick}
            disabled={isTranscribing}
            aria-label={isRecording ? "Arrêter l'enregistrement" : 'Parler'}
          >
            {isRecording ? <MicOff01Icon size={16} /> : <Mic01Icon size={16} />}
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            aria-label="Envoyer"
          >
            <SentIcon size={16} />
          </Button>
        </div>
      </div>

      {pendingConfirm?.kind === 'mic' && (
        <ConfirmActivationModal
          title="Activer le micro ?"
          description="Ask Nyx va utiliser ton micro pour transcrire ta question en local (via Whisper) — rien n'est envoyé en dehors de ta machine."
          onConfirm={confirmActivation}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
      {pendingConfirm?.kind === 'speak' && (
        <ConfirmActivationModal
          title="Activer la lecture audio ?"
          description="Ask Nyx va lire cette réponse à voix haute via la synthèse vocale locale (Piper)."
          onConfirm={confirmActivation}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  )
}
