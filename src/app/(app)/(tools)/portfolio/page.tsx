import { labRepo, projectRepo, certificationRepo, statsRepo } from '@/repositories'
import { PortfolioPage } from '@/components/features/portfolio/PortfolioPage'

export default async function Page(): Promise<React.JSX.Element> {
  const [completedLabs, completedProjects, certifications, credits] = await Promise.all([
    labRepo.findCompletedSessions(),
    projectRepo.findCompleted(),
    certificationRepo.findAll(),
    statsRepo.getEarnedCredits(),
  ])

  return (
    <PortfolioPage
      completedLabs={completedLabs}
      completedProjects={completedProjects}
      certifications={certifications}
      credits={credits}
    />
  )
}
