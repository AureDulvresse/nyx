'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search01Icon, StickyNote01Icon, Comment01Icon } from 'hugeicons-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DateUtils } from '@/lib/utils/date.utils'
import type { ChapterNoteItem, CommentWithContext } from '@/domain'

export function NotesPage({
  chapterNotes,
  comments,
}: {
  chapterNotes: ChapterNoteItem[]
  comments: CommentWithContext[]
}) {
  const [query, setQuery] = useState('')

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chapterNotes
    return chapterNotes.filter(
      (n) => n.notes.toLowerCase().includes(q) || n.chapterTitle.toLowerCase().includes(q) || n.courseTitle.toLowerCase().includes(q)
    )
  }, [chapterNotes, query])

  const filteredComments = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return comments
    return comments.filter(
      (c) => c.content.toLowerCase().includes(q) || c.chapterTitle.toLowerCase().includes(q) || c.courseTitle.toLowerCase().includes(q)
    )
  }, [comments, query])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mes notes"
        description="Toutes tes notes et commentaires de chapitre au même endroit, indépendamment du cours d'origine."
      />

      <div className="relative max-w-md">
        <Search01Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrer par mot-clé..." className="pl-9" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Notes de chapitre ({filteredNotes.length})</h2>
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={StickyNote01Icon}
            title="Aucune note trouvée"
            description={
              query
                ? 'Aucune note ne correspond à ta recherche.'
                : 'Ajoute des notes depuis n\'importe quel chapitre pour les retrouver ici.'
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <Link key={note.chapterId} href={`/courses/${note.courseSlug}/${note.chapterNumber}`} className="block">
                <Card className="p-4 transition-colors hover:border-violet-nyx/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">{note.chapterTitle}</p>
                    <span className="shrink-0 text-xs text-text-secondary">{DateUtils.relative(note.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{note.courseTitle}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{note.notes}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Commentaires ({filteredComments.length})</h2>
        {filteredComments.length === 0 ? (
          <EmptyState
            icon={Comment01Icon}
            title="Aucun commentaire trouvé"
            description={
              query
                ? 'Aucun commentaire ne correspond à ta recherche.'
                : 'Les commentaires que tu laisses sur les chapitres apparaîtront ici.'
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredComments.map((comment) => (
              <Link key={comment.id} href={`/courses/${comment.courseSlug}/${comment.chapterNumber}`} className="block">
                <Card className="p-4 transition-colors hover:border-violet-nyx/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">{comment.chapterTitle}</p>
                    <span className="shrink-0 text-xs text-text-secondary">{DateUtils.relative(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{comment.courseTitle}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{comment.content}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
