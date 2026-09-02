'use client'

import { Search01Icon, StarIcon } from 'hugeicons-react'
import { Input } from '@/components/ui/input'
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
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Rechercher une commande, un outil..."
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(undefined)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            !category ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
          )}
        >
          Toutes
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              category === c ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
          >
            {c}
          </button>
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
