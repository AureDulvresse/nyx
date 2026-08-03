import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight01Icon } from 'hugeicons-react'
import { quizRepo, chapterRepo, courseRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { QuizSession } from '@/components/features/quiz/QuizSession'

export default async function Page({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const [quiz, chapter] = await Promise.all([quizRepo.findByChapter(chapterId), chapterRepo.findById(chapterId)])
  if (!quiz || !chapter) notFound()

  const course = await courseRepo.findById(chapter.courseId)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {course && (
        <nav className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Link href="/courses" className="hover:text-text-primary">
            Cours
          </Link>
          <ArrowRight01Icon size={12} className="shrink-0" />
          <Link href={`/courses/${course.slug}`} className="hover:text-text-primary">
            {course.title}
          </Link>
          <ArrowRight01Icon size={12} className="shrink-0" />
          <Link href={`/courses/${course.slug}/${chapter.number}`} className="hover:text-text-primary">
            {chapter.title}
          </Link>
        </nav>
      )}
      <PageHeader title={quiz.title} description={`${quiz.questions.length} questions`} />
      <QuizSession quiz={quiz} />
    </div>
  )
}
