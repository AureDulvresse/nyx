'use client'

import { CheatSearchBar } from './CheatSearchBar'
import { CommandGrid } from './CommandGrid'
import { useCheatSearch } from '@/hooks/useCheatSearch'
import type { CheatEntry } from '@/domain'

export function CheatsheetExplorer({ initialEntries, categories }: { initialEntries: CheatEntry[]; categories: string[] }) {
  const { query, setQuery, category, setCategory, entries } = useCheatSearch(initialEntries)

  return (
    <div className="space-y-6">
      <CheatSearchBar
        query={query}
        onQueryChange={setQuery}
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
      />
      <CommandGrid entries={entries} />
    </div>
  )
}
