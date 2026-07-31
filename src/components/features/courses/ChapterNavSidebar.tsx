import Link from 'next/link'
import { CheckmarkCircle02Icon, CircleIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils/cn'
import { Progress } from '@/components/ui/progress'
import type { Chapter } from '@/domain'

export function ChapterNavSidebar({
  courseSlug,
  chapters,
  currentNumber,
}: {
  courseSlug: string
  chapters: Chapter[]
  currentNumber: number
}) {
  const completedCount = chapters.filter((c) => c.status === 'completed').length
  const percentage = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0

  return (
    <nav className="sticky top-20 hidden w-64 shrink-0 self-start lg:block">
      <div className="mb-3 px-1">
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
          <span>
            {completedCount}/{chapters.length} chapitres
          </span>
          <span className="font-medium text-purple">{percentage}%</span>
        </div>
        <Progress value={percentage} />
      </div>

      <div className="space-y-1">
        {chapters.map((chapter) => {
          const isCurrent = chapter.number === currentNumber
          const isCompleted = chapter.status === 'completed'
          return (
            <Link
              key={chapter.id}
              href={`/courses/${courseSlug}/${chapter.number}`}
              className={cn(
                'flex items-start gap-2.5 rounded-md px-3 py-2 text-sm leading-snug transition-colors',
                isCurrent
                  ? 'bg-violet-nyx/15 font-medium text-purple'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              )}
            >
              {isCompleted ? (
                <CheckmarkCircle02Icon size={16} className="mt-0.5 shrink-0 text-green" />
              ) : (
                <CircleIcon size={16} className={cn('mt-0.5 shrink-0', isCurrent ? 'text-purple' : 'text-text-secondary/50')} />
              )}
              <span>
                {chapter.number}. {chapter.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
