import { PageHeader } from '@/components/common/PageHeader'
import { DashboardStats } from './DashboardStats'
import { WeeklyChart } from './WeeklyChart'
import { LevelCard } from './LevelCard'
import { ActivityHeatmap } from './ActivityHeatmap'
import { WeakChaptersCard } from './WeakChaptersCard'
import { CourseGrid } from '@/components/features/courses/CourseGrid'
import type { Course, QuizAttempt, WeakChapter } from '@/domain'
import type { SkillLevel, ActivityDay } from '@/services'

export function DashboardPage({
  globalProgress,
  courses,
  recentAttempts,
  flashcardsDue,
  weeklyActivity,
  labsCompleted,
  skill,
  activityHeatmap,
  weakChapters,
}: {
  globalProgress: { total: number; completed: number; percentage: number }
  courses: Course[]
  recentAttempts: QuizAttempt[]
  flashcardsDue: number
  weeklyActivity: { day: string; chapters: number }[]
  labsCompleted: number
  skill: SkillLevel
  activityHeatmap: ActivityDay[]
  weakChapters: WeakChapter[]
}) {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Bienvenue sur Nyx — reprends là où tu t'es arrêté." />

      <LevelCard skill={skill} />

      <DashboardStats
        globalProgress={globalProgress}
        flashcardsDue={flashcardsDue}
        coursesCount={courses.length}
        labsCompleted={labsCompleted}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyChart data={weeklyActivity} />
        <ActivityHeatmap days={activityHeatmap} />
      </div>

      <WeakChaptersCard chapters={weakChapters} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Tes cours</h2>
        <CourseGrid courses={courses} />
      </div>

      {recentAttempts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Derniers quiz</h2>
          <div className="space-y-2">
            {recentAttempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-sm">
                <span className="text-text-secondary">{a.score}/{a.total} bonnes réponses</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
