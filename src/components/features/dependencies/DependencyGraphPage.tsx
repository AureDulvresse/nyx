import Link from 'next/link'
import * as Icons from 'hugeicons-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/domain'

const IconMap = Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>>

export function DependencyGraphPage({ courses }: { courses: Course[] }) {
  const bySlug = new Map(courses.map((c) => [c.slug, c]))
  const dependents = new Map<string, Course[]>()
  for (const course of courses) {
    for (const depSlug of course.dependsOn) {
      const list = dependents.get(depSlug) ?? []
      list.push(course)
      dependents.set(depSlug, list)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dépendances entre cours"
        description="Quel cours s'appuie sur quel autre — le maillage de rappels tissé tout au long du contenu, rendu visible."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const Icon = IconMap[course.icon] ?? Icons.BookOpen01Icon
          const dependsOnCourses = course.dependsOn.map((s) => bySlug.get(s)).filter((c): c is Course => !!c)
          const referencedBy = dependents.get(course.slug) ?? []

          return (
            <Card key={course.slug} className="p-4">
              <Link href={`/courses/${course.slug}`} className="flex items-center gap-2">
                <div className="rounded-md p-1.5" style={{ backgroundColor: `${course.color}22` }}>
                  <Icon size={16} style={{ color: course.color }} />
                </div>
                <h3 className="font-semibold text-text-primary hover:text-purple">{course.title}</h3>
              </Link>

              <div className="mt-3 space-y-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">S&apos;appuie sur</p>
                  {dependsOnCourses.length === 0 ? (
                    <span className="text-xs text-text-secondary">Aucun prérequis</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {dependsOnCourses.map((c) => (
                        <Link key={c.slug} href={`/courses/${c.slug}`}>
                          <Badge variant="outline">{c.title}</Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {referencedBy.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">Référencé par</p>
                    <div className="flex flex-wrap gap-1.5">
                      {referencedBy.map((c) => (
                        <Link key={c.slug} href={`/courses/${c.slug}`}>
                          <Badge variant="teal">{c.title}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
