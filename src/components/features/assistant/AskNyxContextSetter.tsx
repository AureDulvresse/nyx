'use client'

import { useEffect } from 'react'
import { useAskNyxStore } from '@/lib/store/ask-nyx.store'
import type { AskNyxContext } from '@/domain'

// Mount this inside any chapter/lab/TP page so the floating Ask Nyx widget picks up what the
// user is currently looking at — cleared on unmount so a stale context never leaks into
// whatever page the user navigates to next.
export function AskNyxContextSetter({ context }: { context: AskNyxContext }) {
  const setContext = useAskNyxStore((s) => s.setContext)
  const clearContext = useAskNyxStore((s) => s.clearContext)
  const { kind, title, excerpt } = context

  useEffect(() => {
    setContext({ kind, title, excerpt })
    return () => clearContext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, title, excerpt])

  return null
}
