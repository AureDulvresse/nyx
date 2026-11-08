import type { ReactNode } from 'react'
import Link from 'next/link'
import { Clock01Icon, Target02Icon, ArrowRight01Icon, BookOpen01Icon } from 'hugeicons-react'
import { ChapterNavSidebar } from './ChapterNavSidebar'
import { ChapterFooterNav } from './ChapterFooterNav'
import { CommentSection } from './CommentSection'
import { ResourceSection } from './ResourceSection'
import { PracticeLinks } from './PracticeLinks'
import { ReadAloudButton } from './ReadAloudButton'
import { ReadingProgressBar } from './ReadingProgressBar'
import { ChapterTocDesktop, ChapterTocMobile } from './ChapterToc'
import { ChapterKeyboardNav } from './ChapterKeyboardNav'
import { ChapterCompleteButton, ChapterReviewedButton } from './ChapterHeaderActions'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { stripMarkdownForSpeech } from '@/lib/utils/speech.utils'
import { estimateReadingMinutes, extractHeadings } from '@/lib/utils/markdown.utils'
import type { Chapter, ChapterFrontmatter, Comment, Course, Quiz, Resource, TP } from '@/domain'

// Server component: only the interactive bits (progress bar, TOC, buttons, comments…) ship JS.
export function ChapterPage({
  course,
  frontmatter,
  mdxContent,
  rawSource,
  currentChapter,
  comments,
  resources,
  quiz,
  tp,
}: {
  course: Course & { chapters: Chapter[] }
  frontmatter: ChapterFrontmatter
  mdxContent: ReactNode
  rawSource: string
  currentChapter: Chapter
  comments: Comment[]
  resources: Resource[]
  quiz: Quiz | null
  tp: TP | null
}): React.JSX.Element {
  const headings = extractHeadings(rawSource)
  const speechText = stripMarkdownForSpeech(rawSource)
  const readingMinutes = estimateReadingMinutes(rawSource)

  const sortedChapters = [...course.chapters].sort((a, b) => a.number - b.number)
  const currentIndex = sortedChapters.findIndex((c) => c.number === currentChapter.number)
  const previousChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null
  const hrefFor = (c: Chapter | null): string | null => (c ? `/courses/${course.slug}/${c.number}` : null)

  return (
    <div className="flex gap-8">
      <ReadingProgressBar />
      <ChapterNavSidebar courseSlug={course.slug} chapters={course.chapters} currentNumber={currentChapter.number} />

      <article className="min-w-0 flex-1 space-y-10">
        <div>
          <nav aria-label="Fil d'Ariane" className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary">
            <Link href="/courses" className="hover:text-text-primary">
              Cours
            </Link>
            <ArrowRight01Icon size={12} className="shrink-0" aria-hidden />
            <Link href={`/courses/${course.slug}`} className="hover:text-text-primary">
              {course.title}
            </Link>
            <ArrowRight01Icon size={12} className="shrink-0" aria-hidden />
            <span aria-current="page">
              Chapitre {currentChapter.number}/{sortedChapters.length}
            </span>
          </nav>

          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{frontmatter.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <DifficultyBadge difficulty={frontmatter.difficulty} />
                {frontmatter.duration > 0 && (
                  <span className="flex items-center gap-1 text-xs text-text-secondary" title="Durée estimée du chapitre (lab compris)">
                    <Clock01Icon size={14} aria-hidden /> {frontmatter.duration} min
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-text-secondary" title="Temps de lecture estimé">
                  <BookOpen01Icon size={14} aria-hidden /> ~{readingMinutes} min de lecture
                </span>
                <ChapterReviewedButton chapterId={currentChapter.id} lastReviewedAt={currentChapter.lastReviewedAt ?? null} />
              </div>
              <div className="mt-3">
                <ReadAloudButton text={speechText} />
              </div>
            </div>
            <ChapterCompleteButton
              chapterId={currentChapter.id}
              chapterTitle={frontmatter.title}
              status={currentChapter.status}
            />
          </div>

          {frontmatter.objectives?.length > 0 && (
            <div className="mb-6 rounded-lg border border-violet-nyx/30 bg-violet-nyx/5 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple">
                <Target02Icon size={16} aria-hidden /> Ce que vous allez apprendre
              </p>
              <ul className="space-y-1 text-sm text-text-secondary">
                {frontmatter.objectives.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-purple" aria-hidden>
                      ›
                    </span>{' '}
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ChapterTocMobile headings={headings} />

          {/* scroll-mt keeps anchored headings clear of the sticky header. */}
          <div className="[&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20">{mdxContent}</div>
        </div>

        <div className="space-y-3">
          <ChapterFooterNav
            courseSlug={course.slug}
            currentChapterId={currentChapter.id}
            isCurrentCompleted={currentChapter.status === 'completed'}
            previous={previousChapter}
            next={nextChapter}
          />
          <ChapterKeyboardNav previousHref={hrefFor(previousChapter)} nextHref={hrefFor(nextChapter)} />
        </div>

        <hr className="border-border" />
        <PracticeLinks quiz={quiz} tp={tp} />

        <hr className="border-border" />
        <ResourceSection chapterId={currentChapter.id} initialResources={resources} />

        <hr className="border-border" />
        <CommentSection chapterId={currentChapter.id} initialComments={comments} />
      </article>

      <ChapterTocDesktop headings={headings} />
    </div>
  )
}
