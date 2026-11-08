'use client'

import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { Award01Icon, CheckmarkCircle02Icon, GridViewIcon } from 'hugeicons-react'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterChip } from '@/components/common/FilterChip'
import { NoResults } from '@/components/common/NoResults'
import { LabCard } from './LabCard'
import { LAB_CATEGORY_CONFIG } from '@/lib/lab-category'
import { DIFFICULTY_LABELS } from '@/lib/constants'
import type { Lab, LabCategory, LabDifficulty } from '@/domain'

type SortKey = 'default' | 'difficulty' | 'time' | 'points'

const DIFFICULTY_ORDER: Record<LabDifficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 }

const SORT_LABELS: Record<SortKey, string> = {
  default: 'Par défaut',
  difficulty: 'Difficulté',
  time: 'Temps estimé',
  points: 'Points',
}

export function LabsExplorer({ labs, pointsByLab = {} }: { labs: Lab[]; pointsByLab?: Record<string, number> }): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<LabCategory | null>(null)
  const [difficulty, setDifficulty] = useState<LabDifficulty | null>(null)
  const [sort, setSort] = useState<SortKey>('default')

  const categoriesPresent = useMemo(
    () => Array.from(new Set(labs.map((l) => l.category))) as LabCategory[],
    [labs]
  )

  const completedCount = useMemo(() => Object.keys(pointsByLab).length, [pointsByLab])
  const pointsEarned = useMemo(() => Object.values(pointsByLab).reduce((sum, p) => sum + p, 0), [pointsByLab])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = labs.filter(
      (lab) =>
        (!category || lab.category === category) &&
        (!difficulty || lab.difficulty === difficulty) &&
        (!q || lab.title.toLowerCase().includes(q) || lab.description.toLowerCase().includes(q))
    )

    if (sort === 'difficulty') return [...result].sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
    if (sort === 'time') return [...result].sort((a, b) => a.estimatedTime - b.estimatedTime)
    if (sort === 'points') return [...result].sort((a, b) => b.totalPoints - a.totalPoints)
    return result
  }, [labs, category, difficulty, query, sort])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
        <span className="flex items-center gap-1.5 text-text-secondary">
          <GridViewIcon size={15} /> {labs.length} lab{labs.length > 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5 text-green">
          <CheckmarkCircle02Icon size={15} /> {completedCount} complété{completedCount > 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5 text-orange">
          <Award01Icon size={15} /> {pointsEarned} pts gagnés
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un lab..." className="max-w-md flex-1" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-secondary outline-none focus:border-violet-nyx/50"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                Trier : {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!category} onClick={() => setCategory(null)}>
            Toutes catégories
          </FilterChip>
          {categoriesPresent.map((c) => {
            const config = LAB_CATEGORY_CONFIG[c]
            return (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)} className="flex items-center gap-1.5">
                <config.icon size={13} />
                {config.label}
              </FilterChip>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={!difficulty} onClick={() => setDifficulty(null)} variant="outline">
            Tous niveaux
          </FilterChip>
          {(Object.keys(DIFFICULTY_LABELS) as LabDifficulty[]).map((d) => (
            <FilterChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)} variant="outline">
              {DIFFICULTY_LABELS[d]}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <m.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((lab) => (
            <m.div
              key={lab.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <LabCard lab={lab} pointsEarned={pointsByLab[lab.id]} />
            </m.div>
          ))}
        </m.div>
      ) : (
        <NoResults>Aucun lab ne correspond à ces filtres.</NoResults>
      )}
    </div>
  )
}
