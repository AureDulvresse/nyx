import { notFound } from 'next/navigation'
import { quizRepo, chapterRepo, courseRepo } from '@/repositories'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { PageHeader } from '@/components/common/PageHeader'
import { QuizSession } from '@/components/features/quiz/QuizSession'

export default async function Page({ params }: { params: Promise<{ chapterId: string }> }): Promise<React.JSX.Element> {
  const { chapterId } = await params
  const [quiz, chapter] = await Promise.all([quizRepo.findByChapter(chapterId), chapterRepo.findById(chapterId)])
  if (!quiz || !chapter) notFound()

  const course = await courseRepo.findById(chapter.courseId)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {course && (
        <Breadcrumb
          items={[
            { label: 'Cours', href: '/courses' },
            { label: course.title, href: `/courses/${course.slug}` },
            { label: chapter.title, href: `/courses/${course.slug}/${chapter.number}` },
          ]}
        />
      )}
      <PageHeader title={quiz.title} description={`${quiz.questions.length} questions`} />
      <QuizSession quiz={quiz} />
    </div>
  )
}
