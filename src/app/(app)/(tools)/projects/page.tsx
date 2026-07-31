import { projectRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { ProjectsExplorer } from '@/components/features/projects/ProjectsExplorer'

export default async function Page() {
  const projects = await projectRepo.findAll()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projets"
        description="Des idées de projets pour aller plus loin que les cours et labs — ou lance le tien."
      />
      <ProjectsExplorer projects={projects} />
    </div>
  )
}
