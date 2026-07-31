import { labRepo, projectRepo, certificationRepo, statsRepo } from '@/repositories'
import { PortfolioPage } from '@/components/features/portfolio/PortfolioPage'

export default async function Page() {
  const [completedLabs, projects, certifications, credits] = await Promise.all([
    labRepo.findCompletedSessions(),
    projectRepo.findAll(),
    certificationRepo.findAll(),
    statsRepo.getEarnedCredits(),
  ])

  const completedProjects = projects.filter((p) => p.status === 'completed')

  return (
    <PortfolioPage
      completedLabs={completedLabs}
      completedProjects={completedProjects}
      certifications={certifications}
      credits={credits}
    />
  )
}
