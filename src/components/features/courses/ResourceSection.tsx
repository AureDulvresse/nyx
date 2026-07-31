'use client'

import { useState, useTransition } from 'react'
import { Link04Icon, Delete02Icon, Add01Icon, CheckmarkBadge01Icon, Upload01Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { addResource, deleteResource, uploadChapterMedia } from '@/actions'
import type { Resource, ResourceType } from '@/domain'

const TYPE_LABELS: Record<ResourceType, string> = {
  link: 'Lien',
  pdf: 'PDF',
  video: 'Vidéo',
  tool: 'Outil',
  article: 'Article',
  image: 'Image',
}

export function ResourceSection({ chapterId, initialResources }: { chapterId: string; initialResources: Resource[] }) {
  const [resources, setResources] = useState(initialResources)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'link' | 'file'>('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<ResourceType>('link')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setFile(null)
    setShowForm(false)
  }

  const handleSubmitLink = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await addResource({ chapterId, title: title.trim(), url: url.trim(), type })
      if (res.success) {
        setResources((r) => [...r, res.data])
        resetForm()
      } else {
        setError(res.error)
      }
    })
  }

  const handleSubmitFile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('chapterId', chapterId)
      formData.set('title', title.trim())
      formData.set('file', file)
      const res = await uploadChapterMedia(formData)
      if (res.success) {
        setResources((r) => [...r, res.data])
        resetForm()
      } else {
        setError(res.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteResource({ resourceId: id })
      if (res.success) setResources((r) => r.filter((res) => res.id !== id))
    })
  }

  const curated = resources.filter((r) => r.isCurated)
  const userResources = resources.filter((r) => !r.isCurated)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Link04Icon size={20} /> Ressources
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setShowForm((s) => !s)}>
          <Add01Icon size={16} /> Ajouter
        </Button>
      </div>

      {curated.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Sélection Nyx</p>
          {curated.map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-3 p-3">
              <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="flex min-w-0 items-center gap-2 text-sm text-blue hover:underline">
                <CheckmarkBadge01Icon size={15} className="shrink-0 text-teal" />
                <span className="truncate">{r.title}</span>
              </a>
              <Badge variant="outline">{TYPE_LABELS[r.type]}</Badge>
            </Card>
          ))}
        </div>
      )}

      {userResources.length === 0 && !showForm && curated.length === 0 && (
        <p className="text-sm text-text-secondary">Aucune ressource liée à ce chapitre.</p>
      )}

      <div className="space-y-2">
        {userResources.length > 0 && curated.length > 0 && (
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Tes ressources</p>
        )}
        {userResources.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-3 p-3">
            <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="flex min-w-0 items-center gap-2 text-sm text-blue hover:underline">
              <span className="truncate">{r.title}</span>
            </a>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{TYPE_LABELS[r.type]}</Badge>
              <button onClick={() => handleDelete(r.id)} className="text-text-secondary hover:text-red transition-colors" aria-label="Supprimer">
                <Delete02Icon size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="space-y-3 rounded-md border border-border bg-surface p-4">
          <div className="flex gap-1 rounded-full bg-background p-1 w-fit">
            <button
              type="button"
              onClick={() => setMode('link')}
              className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors', mode === 'link' ? 'bg-violet-nyx text-white' : 'text-text-secondary')}
            >
              Lien
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors', mode === 'file' ? 'bg-violet-nyx text-white' : 'text-text-secondary')}
            >
              Fichier (image/vidéo)
            </button>
          </div>

          {mode === 'link' ? (
            <form onSubmit={handleSubmitLink} className="space-y-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la ressource" required />
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." type="url" required />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {error && <p className="text-sm text-red">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  Ajouter
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitFile} className="space-y-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du média" required />
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-sm text-text-secondary hover:border-violet-nyx/50">
                <Upload01Icon size={16} />
                {file ? file.name : 'Choisir une image ou une vidéo (max 25 Mo)'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/ogg"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {error && <p className="text-sm text-red">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={isPending || !file || !title.trim()}>
                  {isPending ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
