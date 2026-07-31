import { notFound } from 'next/navigation'
import { quizRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { QuizSession } from '@/components/features/quiz/QuizSession'

export default async function Page({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const quiz = await quizRepo.findByChapter(chapterId)
  if (!quiz) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title={quiz.title} description={`${quiz.questions.length} questions`} />
      <QuizSession quiz={quiz} />
    </div>
  )
}
