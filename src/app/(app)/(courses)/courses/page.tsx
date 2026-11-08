import { courseRepo, chapterRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { CourseCatalog } from '@/components/features/courses/CourseCatalog'
import { GlobalProgressSummary } from '@/components/features/courses/GlobalProgressSummary'

export default async function Page(): Promise<React.JSX.Element> {
  const [courses, progresses, globalProgress] = await Promise.all([
    courseRepo.findAll(),
    chapterRepo.getAllCourseProgress(),
    chapterRepo.getGlobalProgress(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cours"
        description={`${courses.length} cours, ${globalProgress.total} chapitres — de Linux à l'IA appliquée à la cybersécurité.`}
        actions={<GlobalProgressSummary {...globalProgress} />}
      />
      <CourseCatalog courses={courses} progresses={progresses} />
    </div>
  )
}
