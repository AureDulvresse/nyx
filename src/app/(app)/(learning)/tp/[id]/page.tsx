import { notFound } from 'next/navigation'
import { tpRepo, chapterRepo, courseRepo } from '@/repositories'
import { TPDetailPage } from '@/components/features/tp/TPDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const { id } = await params
  const tp = await tpRepo.findById(id)
  if (!tp) notFound()

  const chapter = await chapterRepo.findById(tp.chapterId)
  const course = chapter ? await courseRepo.findById(chapter.courseId) : null

  return <TPDetailPage tp={tp} chapter={chapter} course={course} />
}
