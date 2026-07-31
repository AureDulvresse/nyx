'use client'

import { useMemo, useState } from 'react'
import { Search01Icon } from 'hugeicons-react'
import { Input } from '@/components/ui/input'
import { TPCard } from './TPCard'
import type { TP } from '@/domain'

export function TPExplorer({ tps }: { tps: TP[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tps
    return tps.filter((tp) => tp.title.toLowerCase().includes(q) || tp.environment.toLowerCase().includes(q))
  }, [tps, query])

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un TP..."
          className="pl-10"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tp) => (
            <TPCard key={tp.id} tp={tp} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-text-secondary">Aucun TP ne correspond à ta recherche.</p>
      )}
    </div>
  )
}
