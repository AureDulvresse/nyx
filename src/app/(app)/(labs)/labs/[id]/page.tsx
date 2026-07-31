import { notFound } from 'next/navigation'
import { labRepo, courseRepo } from '@/repositories'
import { MDXLoader } from '@/infrastructure/content'
import { LabMissionPage } from '@/components/features/labs/LabMissionPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lab = await labRepo.findById(id)
  if (!lab || !lab.published) notFound()

  const [content, sessions, prerequisiteCourses] = await Promise.all([
    MDXLoader.getLab(lab.slug),
    labRepo.findSessionsByLabId(lab.id),
    Promise.all(lab.prerequisites.map((slug) => courseRepo.findBySlug(slug))),
  ])

  return (
    <LabMissionPage
      lab={lab}
      content={content}
      sessions={sessions}
      prerequisiteCourses={prerequisiteCourses.filter((c) => c !== null)}
    />
  )
}
