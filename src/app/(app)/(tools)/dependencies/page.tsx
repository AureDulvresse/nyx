import { courseRepo } from '@/repositories'
import { DependencyGraphPage } from '@/components/features/dependencies/DependencyGraphPage'

export default async function Page() {
  const courses = await courseRepo.findAll()
  return <DependencyGraphPage courses={courses} />
}
