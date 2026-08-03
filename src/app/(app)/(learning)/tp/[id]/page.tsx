import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight01Icon } from 'hugeicons-react'
import { tpRepo, chapterRepo, courseRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { StepItem } from '@/components/features/tp/StepItem'
import { TPCompleteButton } from '@/components/features/tp/TPCompleteButton'
import { TPShell } from '@/components/features/tp/TPShell'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tp = await tpRepo.findById(id)
  if (!tp) notFound()

  const chapter = await chapterRepo.findById(tp.chapterId)
  const course = chapter ? await courseRepo.findById(chapter.courseId) : null

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {course && chapter && (
        <nav className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Link href="/courses" className="hover:text-text-primary">
            Cours
          </Link>
          <ArrowRight01Icon size={12} className="shrink-0" />
          <Link href={`/courses/${course.slug}`} className="hover:text-text-primary">
            {course.title}
          </Link>
          <ArrowRight01Icon size={12} className="shrink-0" />
          <Link href={`/courses/${course.slug}/${chapter.number}`} className="hover:text-text-primary">
            {chapter.title}
          </Link>
        </nav>
      )}
      <PageHeader
        title={tp.title}
        description={tp.environment}
        actions={<TPCompleteButton tpId={tp.id} initiallyCompleted={Boolean(tp.completedAt)} />}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Objectifs</h2>
        <ul className="list-inside list-disc space-y-1 text-text-secondary">
          {tp.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Terminal</h2>
        <TPShell tpId={tp.id} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Étapes</h2>
        <div className="space-y-2">
          {tp.steps.map((step, i) => (
            <StepItem key={i} tpId={tp.id} step={step} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
