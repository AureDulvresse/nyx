import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight01Icon } from 'hugeicons-react'
import { courseRepo, examRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { ExamSession } from '@/components/features/quiz/ExamSession'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await courseRepo.findBySlug(slug)
  if (!course) notFound()

  const exam = await examRepo.findByCourse(course.id)
  if (!exam) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <nav className="flex items-center gap-1.5 text-sm text-text-secondary">
        <Link href="/courses" className="hover:text-text-primary">
          Cours
        </Link>
        <ArrowRight01Icon size={12} className="shrink-0" />
        <Link href={`/courses/${course.slug}`} className="hover:text-text-primary">
          {course.title}
        </Link>
      </nav>
      <PageHeader
        title={exam.title}
        description={`${exam.questions.length} questions · ${exam.passingPercentage}% requis pour réussir`}
      />
      <ExamSession exam={exam} courseSlug={course.slug} />
    </div>
  )
}
