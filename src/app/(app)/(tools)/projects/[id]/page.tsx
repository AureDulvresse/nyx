import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft01Icon } from 'hugeicons-react'
import { projectRepo, courseRepo } from '@/repositories'
import { ProjectDetail } from '@/components/features/projects/ProjectDetail'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [project, courses] = await Promise.all([projectRepo.findById(id), courseRepo.findAll()])
  if (!project) notFound()

  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft01Icon size={16} /> Retour aux projets
      </Link>
      <ProjectDetail project={project} courseTitles={courseTitles} />
    </div>
  )
}
