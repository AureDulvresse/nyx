import Link from 'next/link'
import { PlayCircleIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CourseIcon } from '@/components/common/CourseIcon'
import { toPercentage } from '@/lib/utils/math.utils'
import type { ResumePoint } from '@/domain'

/** Prominent "pick up where you left off" card — the main entry point back into studying. */
export function ResumeCard({ resume }: { resume: ResumePoint }): React.JSX.Element {
  const href = `/courses/${resume.courseSlug}/${resume.chapterNumber}`
  const percentage = toPercentage(resume.courseCompleted, resume.courseTotal)

  return (
    <Card className="relative flex h-full flex-col gap-5 overflow-hidden border-violet-nyx/40 p-6">
      {/* Course-colored wash (course colors come from data, hence inline). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ background: `linear-gradient(135deg, ${resume.courseColor}, transparent 60%)` }}
      />

      <div className="relative flex items-start gap-4">
        <div className="rounded-lg bg-background p-3">
          <CourseIcon name={resume.courseIcon} size={24} style={{ color: resume.courseColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple">
            {resume.kind === 'in_progress' ? 'Reprendre' : 'Chapitre suivant'}
          </p>
          <h2 className="mt-1 text-xl font-bold leading-snug text-text-primary">
            {resume.chapterNumber}. {resume.chapterTitle}
          </h2>
          <p className="mt-0.5 truncate text-sm text-text-secondary">{resume.courseTitle}</p>
        </div>
      </div>

      <div className="relative">
        <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
          <span>
            {resume.courseCompleted}/{resume.courseTotal} chapitres terminés
          </span>
          <span className="font-medium text-text-primary">{percentage}%</span>
        </div>
        <Progress value={percentage} color={resume.courseColor} />
      </div>

      <Link
        href={href}
        className="relative mt-auto inline-flex h-11 items-center justify-center gap-2 self-start rounded-md bg-violet-nyx px-6 text-sm font-medium text-white transition-colors hover:bg-violet-nyx/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <PlayCircleIcon size={18} aria-hidden />
        {resume.kind === 'in_progress' ? 'Continuer la lecture' : 'Commencer le chapitre'}
      </Link>
    </Card>
  )
}
