import { notFound } from 'next/navigation'
import { courseRepo, chapterRepo, commentRepo, resourceRepo, quizRepo, tpRepo } from '@/repositories'
import { MDXLoader } from '@/infrastructure/content'
import { ChapterPage } from '@/components/features/courses/ChapterPage'
import { MDXRenderer } from '@/components/features/mdx/MDXRenderer'

export default async function Page({ params }: { params: Promise<{ slug: string; chapter: string }> }) {
  const { slug, chapter } = await params
  const chapterNumber = parseInt(chapter, 10)

  const course = await courseRepo.findWithChapters(slug)
  if (!course) notFound()

  const currentChapter = course.chapters.find((c) => c.number === chapterNumber)
  if (!currentChapter) notFound()

  const [content, progress, comments, resources, quiz, tp] = await Promise.all([
    MDXLoader.getChapter(slug, chapterNumber),
    chapterRepo.getProgressByCourse(course.id),
    commentRepo.findByChapter(currentChapter.id),
    resourceRepo.findByChapter(currentChapter.id),
    quizRepo.findByChapter(currentChapter.id),
    tpRepo.findByChapter(currentChapter.id),
  ])
  if (!content) notFound()

  return (
    <ChapterPage
      course={course}
      frontmatter={content.frontmatter}
      mdxContent={<MDXRenderer source={content.source} />}
      rawSource={content.source}
      currentChapter={currentChapter}
      progress={progress}
      comments={comments}
      resources={resources}
      quiz={quiz}
      tp={tp}
    />
  )
}
