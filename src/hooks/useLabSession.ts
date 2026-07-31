'use client'

import { useState, useCallback, useTransition } from 'react'
import { startLabSession, stopLabSession, submitFlag } from '@/actions/lab.actions'
import type { LabSession, FlagSubmitResult } from '@/domain'

type LabState = 'idle' | 'loading' | 'active' | 'completed'

export function useLabSession(labId: string) {
  const [state, setState] = useState<LabState>('idle')
  const [session, setSession] = useState<LabSession | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()

  const startLab = useCallback(() => {
    setState('loading')
    start(async () => {
      const result = await startLabSession({ labId, userId: 'local-user' })
      if (result.success) {
        setSession(result.data.session)
        setWsUrl(result.data.wsUrl)
        setState('active')
      } else {
        setError(result.error)
        setState('idle')
      }
    })
  }, [labId])

  const stopLab = useCallback(() => {
    if (!session) return
    start(async () => {
      await stopLabSession(session.id)
      setSession(null)
      setWsUrl(null)
      setState('idle')
    })
  }, [session])

  const handleFlagSubmit = useCallback(
    async (flagValue: string, activeElapsedSeconds?: number): Promise<FlagSubmitResult> => {
      if (!session) return { success: false }
      const result = await submitFlag({ sessionId: session.id, flagValue, activeElapsedSeconds })
      if (result.success && result.data.labCompleted) setState('completed')
      return result.success ? result.data : { success: false }
    },
    [session]
  )

  return { state, session, wsUrl, error, isPending, startLab, stopLab, submitFlag: handleFlagSubmit }
}
