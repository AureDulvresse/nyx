import Link from 'next/link'
import { PlayIcon, Award01Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { ProgressService } from '@/services'
import type { Chapter, CourseProgress } from '@/domain'

export function CourseCTA({
  courseSlug,
  chapters,
  progress,
}: {
  courseSlug: string
  chapters: Chapter[]
  progress: CourseProgress
}): React.JSX.Element | null {
  const { nextChapter, hasStarted, examPending } = ProgressService.courseNavigation(chapters, progress)

  if (examPending) {
    return (
      <Link href={`/courses/${courseSlug}/exam`}>
        <Button size="lg" variant="success" className="gap-2 mb-4">
          <Award01Icon size={18} />
          Passer l&apos;examen final
        </Button>
      </Link>
    )
  }

  if (!nextChapter) return null

  return (
    <Link href={`/courses/${courseSlug}/${nextChapter.number}`}>
      <Button size="lg" className="gap-2 mb-4">
        <PlayIcon size={18} />
        {progress.courseCompleted
          ? 'Revoir le cours'
          : hasStarted
            ? `Continuer — Chapitre ${nextChapter.number}`
            : 'Commencer le cours'}
      </Button>
    </Link>
  )
}
