'use client'

import { useMemo, useState } from 'react'
import { Add01Icon, FolderLibraryIcon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChip } from '@/components/common/FilterChip'
import { SearchInput } from '@/components/common/SearchInput'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'
import { PROJECT_CATEGORY_CONFIG, PROJECT_STATUS_LABELS } from '@/lib/project-category'
import type { Project, ProjectCategory, ProjectStatus, ProjectType } from '@/domain'

export function ProjectsExplorer({ projects }: { projects: Project[] }): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ProjectCategory | null>(null)
  const [type, setType] = useState<ProjectType | null>(null)
  const [status, setStatus] = useState<ProjectStatus | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const categoriesPresent = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category))) as ProjectCategory[],
    [projects]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (!category || p.category === category) &&
        (!type || p.type === type) &&
        (!status || p.status === status) &&
        (!q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    )
  }, [projects, category, type, status, query])

  const hasActiveFilters = Boolean(query || category || type || status)
  const resetFilters = () => {
    setQuery('')
    setCategory(null)
    setType(null)
    setStatus(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un projet..." className="max-w-md flex-1" />
          <Button onClick={() => setShowNewModal(true)}>
            <Add01Icon size={16} /> Nouveau projet
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={!type} onClick={() => setType(null)}>
            Tous
          </FilterChip>
          <FilterChip active={type === 'proposed'} onClick={() => setType('proposed')}>
            Idées proposées
          </FilterChip>
          <FilterChip active={type === 'personal'} onClick={() => setType('personal')}>
            Mes projets
          </FilterChip>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={!category} onClick={() => setCategory(null)} variant="outline">
            Toutes catégories
          </FilterChip>
          {categoriesPresent.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)} variant="outline">
              {PROJECT_CATEGORY_CONFIG[c].label}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={!status} onClick={() => setStatus(null)} variant="outline">
            Tous statuts
          </FilterChip>
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(s)} variant="outline">
              {PROJECT_STATUS_LABELS[s]}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderLibraryIcon}
          title={hasActiveFilters ? 'Aucun projet ne correspond à ces filtres' : 'Aucun projet pour le moment'}
          description={hasActiveFilters ? undefined : 'Crée ton premier projet pour suivre tes travaux personnels.'}
          action={
            hasActiveFilters ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowNewModal(true)}>
                <Add01Icon size={16} /> Nouveau projet
              </Button>
            )
          }
        />
      )}

      {showNewModal && <NewProjectModal onClose={() => setShowNewModal(false)} />}
    </div>
  )
}
