'use client'

import { useMemo, useState } from 'react'
import { Search01Icon } from 'hugeicons-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { CourseGrid } from './CourseGrid'
import type { Course, CourseCategory, CourseProgress } from '@/domain'

const CATEGORY_ORDER: CourseCategory[] = ['Fondamentaux', 'Offensif', 'Défensif', 'Data', 'IA / Cyber', 'Transversal']

export function CourseCatalog({ courses, progresses }: { courses: Course[]; progresses: CourseProgress[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CourseCategory | null>(null)

  const categoriesPresent = useMemo(
    () => CATEGORY_ORDER.filter((c) => courses.some((course) => course.category === c)),
    [courses]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses
      .filter((c) => !category || c.category === category)
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .sort((a, b) => a.order - b.order)
  }, [courses, category, query])

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    courses: filtered.filter((c) => c.category === cat),
  })).filter((group) => group.courses.length > 0)

  const isFiltering = query.trim().length > 0 || category !== null

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un cours..."
            className="pl-10"
          />
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
          {categoriesPresent.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                category === c ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-text-secondary">Aucun cours ne correspond à ta recherche.</p>
      ) : isFiltering ? (
        <CourseGrid courses={filtered} progresses={progresses} />
      ) : (
        <div className="space-y-10">
          {byCategory.map(({ category: cat, courses: categoryCourses }) => (
            <section key={cat}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-lg font-semibold text-text-primary">{cat}</h2>
                <span className="text-sm text-text-secondary">{categoryCourses.length} cours</span>
              </div>
              <CourseGrid courses={categoryCourses} progresses={progresses} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
