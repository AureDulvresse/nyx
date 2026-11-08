import { labRepo } from '@/repositories'
import { bestPointsByLab } from '@/services'
import { PageHeader } from '@/components/common/PageHeader'
import { LabsExplorer } from '@/components/features/labs/LabsExplorer'

export default async function Page(): Promise<React.JSX.Element> {
  const [labs, completedSessions] = await Promise.all([labRepo.findAll(), labRepo.findCompletedSessions()])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nyx Labs"
        description={`${labs.length} missions Docker isolées avec terminal Kali intégré.`}
      />
      <LabsExplorer labs={labs} pointsByLab={bestPointsByLab(completedSessions)} />
    </div>
  )
}
