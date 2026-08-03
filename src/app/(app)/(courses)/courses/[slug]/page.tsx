import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PlayIcon, Award01Icon } from 'hugeicons-react'
import { courseRepo, chapterRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { ProgressRing } from '@/components/common/ProgressRing'
import { ChapterList } from '@/components/features/courses/ChapterList'
import { CourseCover } from '@/components/features/courses/CourseCover'
import { Button } from '@/components/ui/button'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await courseRepo.findWithChapters(slug)
  if (!course) notFound()

  const progress = await chapterRepo.getProgressByCourse(course.id)
  const sortedChapters = [...course.chapters].sort((a, b) => a.number - b.number)
  const nextChapter = sortedChapters.find((c) => c.status !== 'completed') ?? sortedChapters[0]
  const hasStarted = sortedChapters.some((c) => c.status !== 'not_started')
  const chaptersDone = progress.percentage === 100
  const examPending = chaptersDone && progress.hasExam && !progress.examPassed

  return (
    <div className="space-y-8">
      <CourseCover course={course} />

      <PageHeader
        title={course.title}
        description={course.description}
        actions={<ProgressRing percentage={progress.percentage} size={56} strokeWidth={5} />}
      />

      {examPending ? (
        <Link href={`/courses/${course.slug}/exam`}>
          <Button size="lg" variant="success" className="gap-2 mb-4">
            <Award01Icon size={18} />
            Passer l'examen final
          </Button>
        </Link>
      ) : (
        nextChapter && (
          <Link href={`/courses/${course.slug}/${nextChapter.number}`}>
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
      )}

      <ChapterList courseSlug={course.slug} chapters={course.chapters} />
    </div>
  )
}
