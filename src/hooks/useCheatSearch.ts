'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { searchCheat } from '@/actions'
import type { CheatEntry } from '@/domain'

export function useCheatSearch(initialEntries: CheatEntry[]) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [entries, setEntries] = useState(initialEntries)
  const [isPending, startTransition] = useTransition()

  const run = useCallback((q: string, cat?: string) => {
    startTransition(async () => {
      const res = await searchCheat({ query: q || undefined, category: cat })
      if (res.success) setEntries(res.data)
    })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => run(query, category), 250)
    return () => clearTimeout(timeout)
  }, [query, category, run])

  return { query, setQuery, category, setCategory, entries, isPending }
}
