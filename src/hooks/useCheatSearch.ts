'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { searchCheat, toggleCheatFavorite } from '@/actions'
import type { CheatEntry } from '@/domain'

export interface CheatSearchState {
  query: string
  setQuery: (query: string) => void
  category: string | undefined
  setCategory: (category: string | undefined) => void
  entries: CheatEntry[]
  isPending: boolean
  toggleFavorite: (id: string) => void
}

function flipFavorite(entries: CheatEntry[], id: string): CheatEntry[] {
  return entries.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
}

export function useCheatSearch(initialEntries: CheatEntry[]): CheatSearchState {
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

  // Optimistic: the server action's revalidatePath('/cheatsheet') doesn't touch this client-held
  // search-result array, so without a local flip the star only reflects the new state after the
  // next search (typing, changing category) happens to refetch it.
  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) => flipFavorite(prev, id))
    toggleCheatFavorite({ cheatId: id }).then((res) => {
      if (!res.success) setEntries((prev) => flipFavorite(prev, id))
    })
  }, [])

  return { query, setQuery, category, setCategory, entries, isPending, toggleFavorite }
}
