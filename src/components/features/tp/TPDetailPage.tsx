import { Breadcrumb } from '@/components/common/Breadcrumb'
import { PageHeader } from '@/components/common/PageHeader'
import { StepItem } from '@/components/features/tp/StepItem'
import { TPCompleteButton } from '@/components/features/tp/TPCompleteButton'
import { TPShell } from '@/components/features/tp/TPShell'
import type { Chapter, Course, TP } from '@/domain'

export function TPDetailPage({
  tp,
  chapter,
  course,
}: {
  tp: TP
  chapter: Chapter | null
  course: Course | null
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {course && chapter && (
        <Breadcrumb
          items={[
            { label: 'Cours', href: '/courses' },
            { label: course.title, href: `/courses/${course.slug}` },
            { label: chapter.title, href: `/courses/${course.slug}/${chapter.number}` },
          ]}
        />
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
