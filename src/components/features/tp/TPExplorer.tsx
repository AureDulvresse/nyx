'use client'

import { useMemo, useState } from 'react'
import { SearchInput } from '@/components/common/SearchInput'
import { NoResults } from '@/components/common/NoResults'
import { TPCard } from './TPCard'
import type { TP } from '@/domain'

export function TPExplorer({ tps }: { tps: TP[] }): React.JSX.Element {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tps
    return tps.filter((tp) => tp.title.toLowerCase().includes(q) || tp.environment.toLowerCase().includes(q))
  }, [tps, query])

  return (
    <div className="space-y-6">
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un TP..." className="max-w-md" />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tp) => (
            <TPCard key={tp.id} tp={tp} />
          ))}
        </div>
      ) : (
        <NoResults>Aucun TP ne correspond à ta recherche.</NoResults>
      )}
    </div>
  )
}
