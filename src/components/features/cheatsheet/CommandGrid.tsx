'use client'

import { CommandCard } from '@/components/common/CommandCard'
import { NoResults } from '@/components/common/NoResults'
import type { CheatEntry } from '@/domain'

export function CommandGrid({ entries, onToggleFavorite }: { entries: CheatEntry[]; onToggleFavorite: (id: string) => void }): React.JSX.Element {
  if (entries.length === 0) {
    return <NoResults>Aucune commande trouvée.</NoResults>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <CommandCard key={entry.id} entry={entry} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  )
}
