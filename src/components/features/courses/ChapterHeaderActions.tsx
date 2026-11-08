'use client'

import { useEffect, useTransition } from 'react'
import { CheckmarkCircle02Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { updateChapterStatus, markChapterReviewed, markChapterStarted } from '@/actions'
import { DateUtils } from '@/lib/utils/date.utils'
import { useToast } from '@/hooks/useToast'
import type { ChapterStatus } from '@/domain'

/** "Vérifié" stamp toggle — sits in the chapter meta line. */
export function ChapterReviewedButton({
  chapterId,
  lastReviewedAt,
}: {
  chapterId: string
  lastReviewedAt: Date | null
}): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => void (await markChapterReviewed({ chapterId })))}
      disabled={isPending}
      title={
        lastReviewedAt
          ? "Marquer comme vérifié à nouveau aujourd'hui"
          : "Marquer ce chapitre comme vérifié aujourd'hui (outils/CVE à jour)"
      }
      className="flex items-center gap-1 rounded text-xs text-text-secondary hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx"
    >
      <CheckmarkCircle02Icon size={14} className={lastReviewedAt ? 'text-teal' : undefined} />
      {lastReviewedAt ? `Vérifié ${DateUtils.relative(lastReviewedAt)}` : 'Jamais vérifié'}
    </button>
  )
}

/** Complete/uncomplete toggle; also flags a fresh chapter as "en cours" on first open. */
export function ChapterCompleteButton({
  chapterId,
  chapterTitle,
  status,
}: {
  chapterId: string
  chapterTitle: string
  status: ChapterStatus
}): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const toast = useToast()
  const isCompleted = status === 'completed'

  useEffect(() => {
    if (status === 'not_started') void markChapterStarted({ chapterId })
    // Only on open of a given chapter — not when status later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId])

  const toggle = (): void => {
    startTransition(async () => {
      const res = await updateChapterStatus({ chapterId, status: isCompleted ? 'in_progress' : 'completed' })
      if (res.success && !isCompleted) toast.success(`Chapitre "${chapterTitle}" marqué terminé.`)
    })
  }

  return (
    <Button disabled={isPending} onClick={toggle} variant={isCompleted ? 'secondary' : 'success'} className="shrink-0">
      {isCompleted ? 'Marquer non terminé' : 'Marquer terminé'}
    </Button>
  )
}
