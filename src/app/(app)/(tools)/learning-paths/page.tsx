import { courseRepo, chapterRepo } from '@/repositories'
import { LEARNING_PATHS } from '@/lib/learning-paths'
import { LearningPathsPage } from '@/components/features/learning-paths/LearningPathsPage'

export default async function Page() {
  const courses = await courseRepo.findAll()
  const progresses = await Promise.all(courses.map((c) => chapterRepo.getProgressByCourse(c.id)))
  const progressBySlug = new Map(progresses.map((p) => [p.slug, p]))
  const courseBySlug = new Map(courses.map((c) => [c.slug, c]))

  return <LearningPathsPage paths={LEARNING_PATHS} courseBySlug={courseBySlug} progressBySlug={progressBySlug} />
}
