import { notFound } from 'next/navigation'
import { courseRepo, examRepo } from '@/repositories'
import { ExamService } from '@/services'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { PageHeader } from '@/components/common/PageHeader'
import { ExamCooldownCard } from '@/components/features/quiz/ExamCooldownCard'
import { ExamSession } from '@/components/features/quiz/ExamSession'

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const { slug } = await params
  const course = await courseRepo.findBySlug(slug)
  if (!course) notFound()

  const exam = await examRepo.findByCourse(course.id)
  if (!exam) notFound()

  const latestAttempt = await examRepo.findLatestAttempt(exam.id)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Breadcrumb
        items={[
          { label: 'Cours', href: '/courses' },
          { label: course.title, href: `/courses/${course.slug}` },
        ]}
      />
      <PageHeader
        title={exam.title}
        description={`${exam.questions.length} questions · ${exam.passingPercentage}% requis pour réussir`}
      />

      {ExamService.isRetakeBlocked(latestAttempt) ? (
        <ExamCooldownCard courseSlug={course.slug} />
      ) : (
        <ExamSession exam={exam} courseSlug={course.slug} />
      )}
    </div>
  )
}
