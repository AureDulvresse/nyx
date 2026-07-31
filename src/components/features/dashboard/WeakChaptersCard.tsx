import Link from 'next/link'
import { Alert02Icon, ArrowRight01Icon } from 'hugeicons-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WeakChapter } from '@/domain'

export function WeakChaptersCard({ chapters }: { chapters: WeakChapter[] }) {
  if (chapters.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Alert02Icon size={18} className="text-orange" />
          Chapitres à réviser
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-text-secondary">
          Ton dernier quiz sur ces chapitres était en dessous de 70% — une révision rapide pourrait t&apos;aider.
        </p>
        <div className="space-y-2">
          {chapters.map((c) => (
            <Link
              key={c.chapterId}
              href={`/courses/${c.courseSlug}/${c.chapterNumber}`}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-sm transition-colors hover:border-violet-nyx/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">{c.chapterTitle}</p>
                <p className="truncate text-xs text-text-secondary">{c.courseTitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="orange">{c.lastPercentage}%</Badge>
                <ArrowRight01Icon size={14} className="text-text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
