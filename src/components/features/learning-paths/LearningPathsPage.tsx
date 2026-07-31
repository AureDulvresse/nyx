import Link from 'next/link'
import * as Icons from 'hugeicons-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Course, CourseProgress } from '@/domain'
import type { LearningPath } from '@/lib/learning-paths'

const IconMap = Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>>

export function LearningPathsPage({
  paths,
  courseBySlug,
  progressBySlug,
}: {
  paths: LearningPath[]
  courseBySlug: Map<string, Course>
  progressBySlug: Map<string, CourseProgress>
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Par où commencer"
        description="Des parcours thématiques qui enchaînent les cours dans un ordre recommandé — à suivre à la lettre ou juste pour t'orienter."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {paths.map((path) => {
          const pathCourses = path.courseSlugs.map((slug) => courseBySlug.get(slug)).filter((c): c is Course => !!c)
          const totalChapters = pathCourses.reduce((sum, c) => sum + (progressBySlug.get(c.slug)?.total ?? 0), 0)
          const completedChapters = pathCourses.reduce((sum, c) => sum + (progressBySlug.get(c.slug)?.completed ?? 0), 0)
          const pathPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0

          return (
            <Card key={path.slug}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{path.title}</CardTitle>
                  <span className="text-sm font-medium text-text-secondary">{pathPercentage}%</span>
                </div>
                <p className="text-sm text-text-secondary">{path.description}</p>
                <Progress value={pathPercentage} />
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {pathCourses.map((course, i) => {
                    const progress = progressBySlug.get(course.slug)
                    const Icon = IconMap[course.icon] ?? Icons.BookOpen01Icon
                    const done = progress ? progress.percentage === 100 : false
                    return (
                      <li key={course.slug}>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-violet-nyx/50"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs text-text-secondary">
                            {i + 1}
                          </span>
                          <Icon size={16} style={{ color: course.color }} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-text-primary">{course.title}</span>
                          {progress && (
                            <span className={`shrink-0 text-xs ${done ? 'text-green' : 'text-text-secondary'}`}>
                              {progress.completed}/{progress.total}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
