'use client'

import { StarIcon } from 'hugeicons-react'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterChip } from '@/components/common/FilterChip'
import { cn } from '@/lib/utils/cn'

export function CheatSearchBar({
  query,
  onQueryChange,
  categories,
  category,
  onCategoryChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}: {
  query: string
  onQueryChange: (q: string) => void
  categories: string[]
  category?: string
  onCategoryChange: (c?: string) => void
  favoritesOnly: boolean
  onFavoritesOnlyChange: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <SearchInput value={query} onChange={onQueryChange} placeholder="Rechercher une commande, un outil..." />
      <div className="flex flex-wrap gap-2">
        <FilterChip active={!category} onClick={() => onCategoryChange(undefined)} className="py-1">
          Toutes
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => onCategoryChange(c)} className="py-1">
            {c}
          </FilterChip>
        ))}
        <button
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
            favoritesOnly ? 'bg-orange text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
          )}
        >
          <StarIcon size={12} fill={favoritesOnly ? 'currentColor' : 'none'} />
          Favoris
        </button>
      </div>
    </div>
  )
}
