import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DateUtils } from '@/lib/utils/date.utils'
import type { ActivityDay } from '@/services'

function levelFor(count: number): string {
  if (count === 0) return 'bg-surface'
  if (count === 1) return 'bg-violet-nyx/30'
  if (count <= 3) return 'bg-violet-nyx/60'
  return 'bg-violet-nyx'
}

export function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  const weeks: ActivityDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${DateUtils.format(day.date)} — ${day.count} action${day.count > 1 ? 's' : ''}`}
                  className={`h-3 w-3 rounded-sm border border-border/50 ${levelFor(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
          Moins
          <div className="h-3 w-3 rounded-sm border border-border/50 bg-surface" />
          <div className="h-3 w-3 rounded-sm border border-border/50 bg-violet-nyx/30" />
          <div className="h-3 w-3 rounded-sm border border-border/50 bg-violet-nyx/60" />
          <div className="h-3 w-3 rounded-sm border border-border/50 bg-violet-nyx" />
          Plus
        </div>
      </CardContent>
    </Card>
  )
}
