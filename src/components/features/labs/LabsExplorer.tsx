'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search01Icon, Award01Icon, CheckmarkCircle02Icon, GridViewIcon } from 'hugeicons-react'
import { Input } from '@/components/ui/input'
import { LabCard } from './LabCard'
import { LAB_CATEGORY_CONFIG } from '@/lib/lab-category'
import { LAB_DIFFICULTY_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import type { Lab, LabCategory, LabDifficulty } from '@/domain'

type SortKey = 'default' | 'difficulty' | 'time' | 'points'

const DIFFICULTY_ORDER: Record<LabDifficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 }

const SORT_LABELS: Record<SortKey, string> = {
  default: 'Par défaut',
  difficulty: 'Difficulté',
  time: 'Temps estimé',
  points: 'Points',
}

export function LabsExplorer({ labs, pointsByLab = {} }: { labs: Lab[]; pointsByLab?: Record<string, number> }) {
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
          <div className="relative max-w-md flex-1">
            <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un lab..."
              className="pl-10"
            />
          </div>
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
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              !category ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
          >
            Toutes catégories
          </button>
          {categoriesPresent.map((c) => {
            const config = LAB_CATEGORY_CONFIG[c]
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  category === c ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
                )}
              >
                <config.icon size={13} />
                {config.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDifficulty(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !difficulty ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary hover:text-text-primary'
            )}
          >
            Tous niveaux
          </button>
          {(Object.keys(LAB_DIFFICULTY_LABELS) as LabDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                difficulty === d ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary hover:text-text-primary'
              )}
            >
              {LAB_DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((lab) => (
            <motion.div
              key={lab.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <LabCard lab={lab} pointsEarned={pointsByLab[lab.id]} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="py-10 text-center text-text-secondary">Aucun lab ne correspond à ces filtres.</p>
      )}
    </div>
  )
}
