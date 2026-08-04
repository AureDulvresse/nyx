import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isSameDay } from 'date-fns'
import { ArrowRight01Icon, CheckmarkCircle02Icon } from 'hugeicons-react'
import { courseRepo, examRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExamSession } from '@/components/features/quiz/ExamSession'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await courseRepo.findBySlug(slug)
  if (!course) notFound()

  const exam = await examRepo.findByCourse(course.id)
  if (!exam) notFound()

  const latestAttempt = await examRepo.findLatestAttempt(exam.id)
  const onCooldown = Boolean(latestAttempt?.passed && isSameDay(latestAttempt.createdAt, new Date()))

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

      {onCooldown ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <CheckmarkCircle02Icon size={32} className="text-green" />
          <div>
            <p className="font-medium text-text-primary">Examen déjà réussi aujourd&apos;hui</p>
            <p className="mt-1 text-sm text-text-secondary">
              Tu peux le repasser (pour t&apos;entraîner ou améliorer ton score) à partir de demain.
            </p>
          </div>
          <Link href={`/courses/${course.slug}`}>
            <Button variant="secondary">Retour au cours</Button>
          </Link>
        </Card>
      ) : (
        <ExamSession exam={exam} courseSlug={course.slug} />
      )}
    </div>
  )
}
