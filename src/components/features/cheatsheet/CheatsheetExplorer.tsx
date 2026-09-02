'use client'

import { useState } from 'react'
import { CheatSearchBar } from './CheatSearchBar'
import { CommandGrid } from './CommandGrid'
import { useCheatSearch } from '@/hooks/useCheatSearch'
import type { CheatEntry } from '@/domain'

export function CheatsheetExplorer({ initialEntries, categories }: { initialEntries: CheatEntry[]; categories: string[] }) {
  const { query, setQuery, category, setCategory, entries, toggleFavorite } = useCheatSearch(initialEntries)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const visibleEntries = favoritesOnly ? entries.filter((e) => e.isFavorite) : entries

  return (
    <div className="space-y-6">
      <CheatSearchBar
        query={query}
        onQueryChange={setQuery}
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />
      <CommandGrid entries={visibleEntries} onToggleFavorite={toggleFavorite} />
    </div>
  )
}
