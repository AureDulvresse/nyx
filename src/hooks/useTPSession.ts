'use client'

import { useState, useCallback, useTransition } from 'react'
import { startTPSession, stopTPSession } from '@/actions'

export type TPShellState = 'idle' | 'loading' | 'active'

export interface TPSessionState {
  state: TPShellState
  sessionId: string | null
  wsUrl: string | null
  error: string | null
  isPending: boolean
  startShell: () => void
  stopShell: () => void
}

export function useTPSession(tpId: string): TPSessionState {
  const [state, setState] = useState<TPShellState>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  const startShell = useCallback(() => {
    setState('loading')
    setError(null)
    start(async () => {
      const result = await startTPSession({ tpId })
      if (result.success) {
        setSessionId(result.data.sessionId)
        setWsUrl(result.data.wsUrl)
        setState('active')
      } else {
        setError(result.error)
        setState('idle')
      }
    })
  }, [tpId])

  const stopShell = useCallback(() => {
    if (!sessionId) return
    start(async () => {
      await stopTPSession({ sessionId })
      setSessionId(null)
      setWsUrl(null)
      setState('idle')
    })
  }, [sessionId])

  return { state, sessionId, wsUrl, error, isPending, startShell, stopShell }
}
