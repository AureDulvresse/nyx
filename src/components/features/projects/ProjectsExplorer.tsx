'use client'

import { useMemo, useState } from 'react'
import { Search01Icon, Add01Icon, FolderLibraryIcon } from 'hugeicons-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'
import { PROJECT_CATEGORY_CONFIG, PROJECT_STATUS_LABELS } from '@/lib/project-category'
import { cn } from '@/lib/utils/cn'
import type { Project, ProjectCategory, ProjectStatus, ProjectType } from '@/domain'

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
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
          <div className="relative max-w-md flex-1">
            <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet..."
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Add01Icon size={16} /> Nouveau projet
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setType(null)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              !type ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
          >
            Tous
          </button>
          <button
            onClick={() => setType('proposed')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              type === 'proposed' ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
          >
            Idées proposées
          </button>
          <button
            onClick={() => setType('personal')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              type === 'personal' ? 'bg-violet-nyx text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
          >
            Mes projets
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !category ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary hover:text-text-primary'
            )}
          >
            Toutes catégories
          </button>
          {categoriesPresent.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                category === c ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary hover:text-text-primary'
              )}
            >
              {PROJECT_CATEGORY_CONFIG[c].label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatus(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !status ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary hover:text-text-primary'
            )}
          >
            Tous statuts
          </button>
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                status === s ? 'border-violet-nyx text-purple' : 'border-border text-text-secondary hover:text-text-primary'
              )}
            >
              {PROJECT_STATUS_LABELS[s]}
            </button>
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
