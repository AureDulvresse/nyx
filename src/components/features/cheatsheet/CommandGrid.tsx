'use client'

import { CommandCard } from '@/components/common/CommandCard'
import type { CheatEntry } from '@/domain'

export function CommandGrid({ entries, onToggleFavorite }: { entries: CheatEntry[]; onToggleFavorite: (id: string) => void }) {
  if (entries.length === 0) {
    return <p className="py-10 text-center text-text-secondary">Aucune commande trouvée.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <CommandCard key={entry.id} entry={entry} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  )
}
