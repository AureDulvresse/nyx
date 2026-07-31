import { BookOpen01Icon, Cards01Icon, Certificate01Icon, IncognitoIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/common/ProgressRing'

export function DashboardStats({
  globalProgress,
  flashcardsDue,
  coursesCount,
  labsCompleted,
}: {
  globalProgress: { total: number; completed: number; percentage: number }
  flashcardsDue: number
  coursesCount: number
  labsCompleted: number
}) {
  const stats = [
    { label: 'Cours', value: coursesCount, icon: BookOpen01Icon, color: 'text-blue' },
    { label: 'Flashcards dues', value: flashcardsDue, icon: Cards01Icon, color: 'text-teal' },
    { label: 'Labs réussis', value: labsCompleted, icon: IncognitoIcon, color: 'text-red' },
    { label: 'Certifications', value: '7 visées', icon: Certificate01Icon, color: 'text-orange' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="flex items-center gap-4 p-5 lg:col-span-1">
        <ProgressRing percentage={globalProgress.percentage} />
        <div>
          <p className="text-sm text-text-secondary">Progression globale</p>
          <p className="text-lg font-semibold text-text-primary">
            {globalProgress.completed}/{globalProgress.total} chapitres
          </p>
        </div>
      </Card>
      {stats.map((s) => (
        <Card key={s.label} className="flex items-center gap-3 p-5">
          <div className="rounded-lg bg-background p-2.5">
            <s.icon size={20} className={s.color} />
          </div>
          <div>
            <p className="text-xs text-text-secondary">{s.label}</p>
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
