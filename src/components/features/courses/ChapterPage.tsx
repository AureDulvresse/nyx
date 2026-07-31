'use client'

import { useMemo, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { Clock01Icon, Target02Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from 'hugeicons-react'
import { ChapterNavSidebar } from './ChapterNavSidebar'
import { ChapterFooterNav } from './ChapterFooterNav'
import { CommentSection } from './CommentSection'
import { ResourceSection } from './ResourceSection'
import { PracticeLinks } from './PracticeLinks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateChapterStatus, markChapterReviewed } from '@/actions'
import { DateUtils } from '@/lib/utils/date.utils'
import { stripMarkdownForSpeech } from '@/lib/utils/speech.utils'
import { AskNyxContextSetter } from '@/components/features/assistant/AskNyxContextSetter'
import { ReadAloudButton } from '@/components/features/assistant/ReadAloudButton'
import type { Chapter, Comment, Course, CourseProgress, Quiz, Resource, TP } from '@/domain'
import type { ChapterFrontmatter } from '@/infrastructure/content'

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

const DIFFICULTY_VARIANT: Record<string, 'green' | 'orange' | 'red'> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
}

export function ChapterPage({
  course,
  frontmatter,
  mdxContent,
  rawSource,
  currentChapter,
  progress,
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
  progress: CourseProgress
  comments: Comment[]
  resources: Resource[]
  quiz: Quiz | null
  tp: TP | null
}) {
  const [isPending, startTransition] = useTransition()
  const [isMarkingReviewed, startReviewTransition] = useTransition()
  const speechText = useMemo(() => stripMarkdownForSpeech(rawSource), [rawSource])

  const toggleComplete = () => {
    startTransition(async () => {
      await updateChapterStatus({
        chapterId: currentChapter.id,
        status: currentChapter.status === 'completed' ? 'in_progress' : 'completed',
      })
    })
  }

  const markReviewed = () => {
    startReviewTransition(async () => {
      await markChapterReviewed({ chapterId: currentChapter.id })
    })
  }

  const sortedChapters = [...course.chapters].sort((a, b) => a.number - b.number)
  const currentIndex = sortedChapters.findIndex((c) => c.number === currentChapter.number)
  const previousChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null

  return (
    <div className="flex gap-8">
      <ChapterNavSidebar courseSlug={course.slug} chapters={course.chapters} currentNumber={currentChapter.number} />

      <div className="min-w-0 flex-1 space-y-10">
        <div>
          <nav className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary">
            <Link href="/courses" className="hover:text-text-primary">
              Cours
            </Link>
            <ArrowRight01Icon size={12} className="shrink-0" />
            <Link href={`/courses/${course.slug}`} className="hover:text-text-primary">
              {course.title}
            </Link>
          </nav>

          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{frontmatter.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={DIFFICULTY_VARIANT[frontmatter.difficulty] ?? 'outline'}>
                  {DIFFICULTY_LABELS[frontmatter.difficulty] ?? frontmatter.difficulty}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                  <Clock01Icon size={14} /> {frontmatter.duration} min
                </span>
                {currentChapter.lastReviewedAt ? (
                  <button
                    onClick={markReviewed}
                    disabled={isMarkingReviewed}
                    title="Marquer comme vérifié à nouveau aujourd'hui"
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-teal"
                  >
                    <CheckmarkCircle02Icon size={14} className="text-teal" />
                    Vérifié {DateUtils.relative(currentChapter.lastReviewedAt)}
                  </button>
                ) : (
                  <button
                    onClick={markReviewed}
                    disabled={isMarkingReviewed}
                    title="Marquer ce chapitre comme vérifié aujourd'hui (outils/CVE à jour)"
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-teal"
                  >
                    <CheckmarkCircle02Icon size={14} />
                    Jamais vérifié
                  </button>
                )}
              </div>
              <div className="mt-3">
                <ReadAloudButton text={speechText} />
              </div>
            </div>
            <Button
              disabled={isPending}
              onClick={toggleComplete}
              variant={currentChapter.status === 'completed' ? 'secondary' : 'success'}
              className="shrink-0"
            >
              {currentChapter.status === 'completed' ? 'Marquer non terminé' : 'Marquer terminé'}
            </Button>
          </div>

          <AskNyxContextSetter
            context={{ kind: 'chapter', title: frontmatter.title, excerpt: speechText.slice(0, 3000) }}
          />

          {frontmatter.objectives?.length > 0 && (
            <div className="mb-6 rounded-lg border border-violet-nyx/30 bg-violet-nyx/5 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple">
                <Target02Icon size={16} /> Ce que vous allez apprendre
              </p>
              <ul className="space-y-1 text-sm text-text-secondary">
                {frontmatter.objectives.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-purple">›</span> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mdxContent}
        </div>

        <ChapterFooterNav
          courseSlug={course.slug}
          currentChapterId={currentChapter.id}
          isCurrentCompleted={currentChapter.status === 'completed'}
          previous={previousChapter}
          next={nextChapter}
        />

        <hr className="border-border" />
        <PracticeLinks quiz={quiz} tp={tp} />

        <hr className="border-border" />
        <ResourceSection chapterId={currentChapter.id} initialResources={resources} />

        <hr className="border-border" />
        <CommentSection chapterId={currentChapter.id} initialComments={comments} />
      </div>
    </div>
  )
}
