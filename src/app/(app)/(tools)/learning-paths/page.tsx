import { courseRepo, chapterRepo } from '@/repositories'
import { LEARNING_PATHS } from '@/lib/learning-paths'
import { LearningPathsPage } from '@/components/features/learning-paths/LearningPathsPage'

export default async function Page(): Promise<React.JSX.Element> {
  const [courses, progresses] = await Promise.all([courseRepo.findAll(), chapterRepo.getAllCourseProgress()])

  return <LearningPathsPage paths={LEARNING_PATHS} courses={courses} progresses={progresses} />
}
