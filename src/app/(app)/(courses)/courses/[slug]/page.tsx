import { notFound } from 'next/navigation'
import { courseRepo, chapterRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { ProgressRing } from '@/components/common/ProgressRing'
import { ChapterList } from '@/components/features/courses/ChapterList'
import { CourseCover } from '@/components/features/courses/CourseCover'
import { CourseCTA } from '@/components/features/courses/CourseCTA'

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const { slug } = await params
  const course = await courseRepo.findWithChapters(slug)
  if (!course) notFound()

  const progress = await chapterRepo.getProgressByCourse(course.id)

  return (
    <div className="space-y-8">
      <CourseCover course={course} />

      <PageHeader
        title={course.title}
        description={course.description}
        actions={<ProgressRing percentage={progress.percentage} size={56} strokeWidth={5} />}
      />

      <CourseCTA courseSlug={course.slug} chapters={course.chapters} progress={progress} />

      <ChapterList courseSlug={course.slug} chapters={course.chapters} />
    </div>
  )
}
