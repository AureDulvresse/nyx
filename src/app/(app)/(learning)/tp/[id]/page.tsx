import { notFound } from 'next/navigation'
import { tpRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { StepItem } from '@/components/features/tp/StepItem'
import { TPCompleteButton } from '@/components/features/tp/TPCompleteButton'
import { TPShell } from '@/components/features/tp/TPShell'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tp = await tpRepo.findById(id)
  if (!tp) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
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
