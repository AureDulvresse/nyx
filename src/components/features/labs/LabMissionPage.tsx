import Link from 'next/link'
import { Clock01Icon, Award01Icon, Flag03Icon, BookOpen01Icon, TransactionHistoryIcon } from 'hugeicons-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { NetworkMap } from './NetworkMap'
import { LabMission } from './LabMission'
import { MDXRenderer } from '@/components/features/mdx/MDXRenderer'
import { LAB_DIFFICULTY_LABELS } from '@/lib/constants'
import { LAB_CATEGORY_CONFIG } from '@/lib/lab-category'
import { DateUtils } from '@/lib/utils/date.utils'
import { stripMarkdownForSpeech } from '@/lib/utils/speech.utils'
import { AskNyxContextSetter } from '@/components/features/assistant/AskNyxContextSetter'
import type { Course, Lab, LabSession } from '@/domain'
import type { LabContent } from '@/infrastructure/content'

const DIFFICULTY_VARIANT: Record<string, 'green' | 'orange' | 'red'> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
}

const SESSION_STATUS_VARIANT: Record<LabSession['status'], 'green' | 'red' | 'orange' | 'outline'> = {
  completed: 'green',
  failed: 'red',
  expired: 'outline',
  active: 'orange',
}

const SESSION_STATUS_LABELS: Record<LabSession['status'], string> = {
  completed: 'Terminée',
  failed: 'Échouée',
  expired: 'Expirée',
  active: 'En cours',
}

export function LabMissionPage({
  lab,
  content,
  sessions = [],
  prerequisiteCourses = [],
}: {
  lab: Lab
  content: LabContent | null
  sessions?: LabSession[]
  prerequisiteCourses?: Course[]
}) {
  const category = LAB_CATEGORY_CONFIG[lab.category] ?? LAB_CATEGORY_CONFIG.exploitation
  const Icon = category.icon
  const pastSessions = sessions.filter((s) => s.status !== 'active')
  const excerpt = content ? stripMarkdownForSpeech(content.source).slice(0, 3000) : lab.description

  return (
    <div className="space-y-8">
      <AskNyxContextSetter context={{ kind: 'lab', title: lab.title, excerpt }} />

      <PageHeader
        title={lab.title}
        description={lab.description}
        actions={
          <>
            <Badge variant="outline" className="flex items-center gap-1">
              <Icon size={12} className={category.color} /> {category.label}
            </Badge>
            <Badge variant={DIFFICULTY_VARIANT[lab.difficulty]}>{LAB_DIFFICULTY_LABELS[lab.difficulty]}</Badge>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Clock01Icon size={16} /> {lab.estimatedTime} min estimées
        </span>
        <span className="flex items-center gap-1.5">
          <Award01Icon size={16} /> {lab.totalPoints} points au total
        </span>
        <span className="flex items-center gap-1.5">
          <Flag03Icon size={16} /> {lab.flags?.length ?? 0} flag{(lab.flags?.length ?? 0) > 1 ? 's' : ''} à capturer
        </span>
      </div>

      {prerequisiteCourses.length > 0 && (
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <BookOpen01Icon size={16} /> Prérequis recommandés
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {prerequisiteCourses.map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`}>
                <Badge variant="outline" className="hover:border-violet-nyx/50">
                  {c.title}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <NetworkMap targets={lab.targets} />

      <LabMission lab={lab} />

      {pastSessions.length > 0 && (
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <TransactionHistoryIcon size={16} /> Historique des sessions
          </h3>
          <div className="mt-3 space-y-2">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="text-text-secondary">
                  {DateUtils.format(s.startedAt, 'dd MMM yyyy à HH:mm')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-text-primary">{s.score + s.bonusPoints} pts</span>
                  <Badge variant={SESSION_STATUS_VARIANT[s.status]}>{SESSION_STATUS_LABELS[s.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {content && <MDXRenderer source={content.source} />}
    </div>
  )
}
