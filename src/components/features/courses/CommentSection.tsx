'use client'

import { useState, useTransition } from 'react'
import { Message01Icon, Delete02Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { addComment, deleteComment } from '@/actions'
import { DateUtils } from '@/lib/utils/date.utils'
import type { Comment } from '@/domain'

export function CommentSection({ chapterId, initialComments }: { chapterId: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    if (!text) return

    startTransition(async () => {
      const res = await addComment({ chapterId, author: 'Aure', content: text })
      if (res.success) {
        setComments((c) => [...c, res.data])
        setContent('')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteComment({ commentId: id })
      if (res.success) setComments((c) => c.filter((cm) => cm.id !== id))
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
        <Message01Icon size={20} /> Commentaires
      </h2>

      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-text-secondary">Aucun commentaire pour ce chapitre.</p>}
        {comments.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{c.author}</p>
                <p className="text-xs text-text-secondary">{DateUtils.relative(c.createdAt)}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-text-secondary hover:text-red transition-colors"
                aria-label="Supprimer"
              >
                <Delete02Icon size={16} />
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{c.content}</p>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Ajoute une note, une remarque ou une question sur ce chapitre..."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
            Publier
          </Button>
        </div>
      </form>
    </div>
  )
}
