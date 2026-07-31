'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { updateChapterStatus } from '@/actions'
import type { Chapter } from '@/domain'

export function ChapterFooterNav({
  courseSlug,
  currentChapterId,
  isCurrentCompleted,
  previous,
  next,
}: {
  courseSlug: string
  currentChapterId: string
  isCurrentCompleted: boolean
  previous: Chapter | null
  next: Chapter | null
}) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!previous && !next) return null

  const nextHref = next ? `/courses/${courseSlug}/${next.number}` : null

  const handleNextClick = (e: React.MouseEvent) => {
    if (!isCurrentCompleted) {
      e.preventDefault()
      setShowConfirm(true)
    }
  }

  const markCompleteAndContinue = () => {
    startTransition(async () => {
      await updateChapterStatus({ chapterId: currentChapterId, status: 'completed' })
      setShowConfirm(false)
      if (nextHref) router.push(nextHref)
    })
  }

  const continueWithoutMarking = () => {
    setShowConfirm(false)
    if (nextHref) router.push(nextHref)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {previous ? (
          <Link href={`/courses/${courseSlug}/${previous.number}`}>
            <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:border-violet-nyx/50">
              <ArrowLeft01Icon size={18} className="shrink-0 text-text-secondary" />
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">Chapitre précédent</p>
                <p className="truncate font-medium text-text-primary">{previous.title}</p>
              </div>
            </Card>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link href={nextHref!} onClick={handleNextClick}>
            <Card className="flex h-full items-center justify-end gap-3 p-4 text-right transition-colors hover:border-violet-nyx/50">
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">Chapitre suivant</p>
                <p className="truncate font-medium text-text-primary">{next.title}</p>
              </div>
              <ArrowRight01Icon size={18} className="shrink-0 text-text-secondary" />
            </Card>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)}>
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckmarkCircle02Icon size={32} className="text-purple" />
            <h3 className="text-lg font-semibold text-text-primary">Marquer ce chapitre comme terminé ?</h3>
            <p className="text-sm text-text-secondary">
              Tu n&apos;as pas encore marqué ce chapitre comme terminé. Veux-tu le faire avant de continuer ?
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button disabled={isPending} onClick={markCompleteAndContinue} variant="success">
              Marquer terminé et continuer
            </Button>
            <Button disabled={isPending} onClick={continueWithoutMarking} variant="secondary">
              Continuer sans marquer
            </Button>
            <Button disabled={isPending} onClick={() => setShowConfirm(false)} variant="ghost">
              Annuler
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
