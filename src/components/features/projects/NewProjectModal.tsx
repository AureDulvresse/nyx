'use client'

import { useState, useTransition } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createPersonalProject } from '@/actions'
import { PROJECT_CATEGORY_CONFIG } from '@/lib/project-category'
import { cn } from '@/lib/utils/cn'
import type { ProjectCategory } from '@/domain'

const CATEGORIES = Object.keys(PROJECT_CATEGORY_CONFIG) as ProjectCategory[]

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('pentest')
  const [resourceUrl, setResourceUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await createPersonalProject({ title, description, category, resourceUrl })
      if (result.success) {
        onClose()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-semibold text-text-primary">Nouveau projet personnel</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Décris ton propre projet — il apparaîtra dans ta bibliothèque, avec son propre suivi.
      </p>

      <div className="mt-4 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du projet"
          maxLength={200}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décris l'objectif, le périmètre, ce que tu veux apprendre ou produire..."
          rows={4}
        />
        <Input
          value={resourceUrl}
          onChange={(e) => setResourceUrl(e.target.value)}
          placeholder="Lien vers une ressource (optionnel)"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                category === c ? 'bg-violet-nyx text-white' : 'bg-background text-text-secondary hover:text-text-primary'
              )}
            >
              {PROJECT_CATEGORY_CONFIG[c].label}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red">{error}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || title.trim().length < 3 || description.trim().length < 1}>
          Créer le projet
        </Button>
      </div>
    </Modal>
  )
}
