'use client'

import { useMemo, useState } from 'react'
import { SearchInput } from '@/components/common/SearchInput'
import { FilterChip } from '@/components/common/FilterChip'
import { NoResults } from '@/components/common/NoResults'
import { CourseGrid } from './CourseGrid'
import type { Course, CourseCategory, CourseProgress } from '@/domain'

const CATEGORY_ORDER: CourseCategory[] = ['Fondamentaux', 'Offensif', 'Défensif', 'Data', 'IA / Cyber', 'Transversal']

export function CourseCatalog({ courses, progresses }: { courses: Course[]; progresses: CourseProgress[] }): React.JSX.Element {
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
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un cours..." className="max-w-md" />
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!category} onClick={() => setCategory(null)}>
            Toutes catégories
          </FilterChip>
          {categoriesPresent.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <NoResults>Aucun cours ne correspond à ta recherche.</NoResults>
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
