import { courseRepo, chapterRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { ProgressRing } from '@/components/common/ProgressRing'
import { CourseCatalog } from '@/components/features/courses/CourseCatalog'

export default async function Page() {
  const courses = await courseRepo.findAll()
  const [progresses, globalProgress] = await Promise.all([
    Promise.all(courses.map((c) => chapterRepo.getProgressByCourse(c.id))),
    chapterRepo.getGlobalProgress(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cours"
        description={`${courses.length} cours, ${globalProgress.total} chapitres — de Linux à l'IA appliquée à la cybersécurité.`}
        actions={
          <div className="flex items-center gap-3">
            <ProgressRing percentage={globalProgress.percentage} size={48} strokeWidth={4} />
            <div className="text-sm">
              <p className="font-medium text-text-primary">
                {globalProgress.completed}/{globalProgress.total}
              </p>
              <p className="text-text-secondary">chapitres</p>
            </div>
          </div>
        }
      />
      <CourseCatalog courses={courses} progresses={progresses} />
    </div>
  )
}
