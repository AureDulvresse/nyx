import { labRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { LabsExplorer } from '@/components/features/labs/LabsExplorer'

export default async function Page() {
  const [labs, completedSessions] = await Promise.all([labRepo.findAll(), labRepo.findCompletedSessions()])

  const pointsByLab = new Map<string, number>()
  for (const s of completedSessions) {
    pointsByLab.set(s.labId, Math.max(pointsByLab.get(s.labId) ?? 0, s.score + s.bonusPoints))
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nyx Labs"
        description={`${labs.length} missions Docker isolées avec terminal Kali intégré.`}
      />
      <LabsExplorer labs={labs} pointsByLab={Object.fromEntries(pointsByLab)} />
    </div>
  )
}
