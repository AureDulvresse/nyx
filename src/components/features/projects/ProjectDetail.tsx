'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  LinkSquare01Icon,
  Delete02Icon,
  Calendar03Icon,
  Add01Icon,
  CheckmarkSquare02Icon,
  SquareIcon,
  Rocket01Icon,
} from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { PROJECT_CATEGORY_CONFIG, PROJECT_STATUS_LABELS } from '@/lib/project-category'
import { updateProjectStatus, updateProjectNotes, updateProjectSteps, deleteProject, adoptProject } from '@/actions'
import { cn } from '@/lib/utils/cn'
import type { Project, ProjectStatus, ProjectStep } from '@/domain'

const STATUS_ORDER: ProjectStatus[] = ['idea', 'in_progress', 'completed']

export function ProjectDetail({
  project,
  courseTitles,
}: {
  project: Project
  courseTitles: Record<string, string>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(project.notes ?? '')
  const [notesSaved, setNotesSaved] = useState(true)
  const [steps, setSteps] = useState<ProjectStep[]>(project.steps)
  const [newStepTitle, setNewStepTitle] = useState('')
  const category = PROJECT_CATEGORY_CONFIG[project.category]
  const Icon = category.icon

  const completedSteps = steps.filter((s) => s.completed).length
  const stepsProgress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0

  const persistSteps = (next: ProjectStep[]) => {
    setSteps(next)
    startTransition(async () => {
      await updateProjectSteps({ projectId: project.id, steps: next })
    })
  }

  const handleToggleStep = (id: string) => {
    persistSteps(steps.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)))
  }

  const handleAddStep = () => {
    const title = newStepTitle.trim()
    if (!title) return
    persistSteps([...steps, { id: crypto.randomUUID(), title, completed: false }])
    setNewStepTitle('')
  }

  const handleRemoveStep = (id: string) => {
    persistSteps(steps.filter((s) => s.id !== id))
  }

  const handleStatusChange = (status: ProjectStatus) => {
    startTransition(async () => {
      await updateProjectStatus({ projectId: project.id, status })
      router.refresh()
    })
  }

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updateProjectNotes({ projectId: project.id, notes })
      if (res.success) setNotesSaved(true)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProject({ projectId: project.id })
      if (res.success) router.push('/projects')
    })
  }

  const handleAdopt = () => {
    startTransition(async () => {
      const res = await adoptProject({ projectId: project.id })
      if (res.success) router.push(`/projects/${res.data.id}`)
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-3 ${category.bg}`}>
              <Icon size={24} className={category.color} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{category.label}</Badge>
                <span className="text-xs text-text-secondary">
                  {project.type === 'proposed' ? 'Idée proposée' : 'Projet personnel'}
                </span>
              </div>
              <h1 className="mt-2 text-xl font-bold text-text-primary">{project.title}</h1>
            </div>
          </div>
          {project.type === 'personal' && (
            <Button variant="ghost" size="icon" disabled={isPending} onClick={handleDelete} aria-label="Supprimer">
              <Delete02Icon size={18} className="text-red" />
            </Button>
          )}
        </div>

        <p className="mt-4 whitespace-pre-line text-sm text-text-secondary">{project.description}</p>

        {project.resourceUrl && (
          <a
            href={project.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue hover:underline"
          >
            <LinkSquare01Icon size={15} /> Ressource liée
          </a>
        )}

        {project.linkedCourses.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-secondary">Cours liés</p>
            <div className="flex flex-wrap gap-1.5">
              {project.linkedCourses.map((slug) => (
                <span key={slug} className="rounded-full bg-background px-2.5 py-1 text-xs text-text-secondary">
                  {courseTitles[slug] ?? slug}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar03Icon size={14} />
          Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
          {project.completedAt && ` · Terminé le ${new Date(project.completedAt).toLocaleDateString('fr-FR')}`}
        </div>

        {project.type === 'proposed' && (
          <Button className="mt-4 w-full" onClick={handleAdopt} disabled={isPending}>
            <Rocket01Icon size={16} /> Adopter cette idée comme projet personnel
          </Button>
        )}
      </Card>

      {project.type === 'personal' && (
        <Card className="p-5">
          <p className="mb-3 text-sm font-medium text-text-primary">Statut</p>
          <div className="flex gap-1.5 rounded-full bg-background p-1.5 w-fit">
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                disabled={isPending}
                onClick={() => handleStatusChange(status)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                  project.status === status ? 'bg-violet-nyx text-white' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {PROJECT_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </Card>
      )}

      {project.type === 'personal' && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Étapes</p>
            {steps.length > 0 && <span className="text-xs text-text-secondary">{completedSteps}/{steps.length}</span>}
          </div>
          {steps.length > 0 && <Progress value={stepsProgress} className="mb-4" />}

          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <button onClick={() => handleToggleStep(step.id)} disabled={isPending} className="shrink-0 text-text-secondary hover:text-teal">
                  {step.completed ? <CheckmarkSquare02Icon size={18} className="text-teal" /> : <SquareIcon size={18} />}
                </button>
                <span className={cn('flex-1 text-sm', step.completed ? 'text-text-secondary line-through' : 'text-text-primary')}>
                  {step.title}
                </span>
                <button onClick={() => handleRemoveStep(step.id)} disabled={isPending} className="shrink-0 text-text-secondary hover:text-red">
                  <Delete02Icon size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
              placeholder="Ajouter une étape..."
            />
            <Button size="sm" variant="secondary" onClick={handleAddStep} disabled={isPending || !newStepTitle.trim()}>
              <Add01Icon size={16} />
            </Button>
          </div>
        </Card>
      )}

      {project.type === 'personal' && (
        <Card className="p-5">
          <p className="mb-3 text-sm font-medium text-text-primary">Journal de bord</p>
          <Textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setNotesSaved(false)
            }}
            placeholder="Note ici l'avancement, les difficultés rencontrées, les ressources trouvées..."
            rows={8}
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleSaveNotes} disabled={isPending || notesSaved}>
              {notesSaved ? 'Enregistré' : 'Enregistrer'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
