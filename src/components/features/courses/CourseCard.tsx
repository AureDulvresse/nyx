'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import * as Icons from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Course, CourseProgress } from '@/domain'

export function CourseCard({ course, progress }: { course: Course; progress?: CourseProgress }) {
  const Icon = (Icons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  >)[course.icon] ?? Icons.BookOpen01Icon

  return (
    <Link href={`/courses/${course.slug}`} className="block h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="h-full"
      >
        <Card className="group relative h-full overflow-hidden p-5 transition-colors hover:border-violet-nyx/50">
          {course.coverImage ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.coverImage} alt="" className="h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            </div>
          ) : (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: course.color }}
            />
          )}

          <div className={course.coverImage ? 'relative mt-12 flex items-start justify-between gap-2' : 'flex items-start justify-between gap-2'}>
            <div className="rounded-lg p-2.5" style={{ backgroundColor: `${course.color}22` }}>
              <Icon size={22} className="shrink-0" style={{ color: course.color }} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline">{course.category}</Badge>
              <span className="text-[11px] text-text-secondary">{course.credits} crédits</span>
            </div>
          </div>

          <h3 className="mt-4 font-semibold text-text-primary transition-colors group-hover:text-purple">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{course.description}</p>

          {progress && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
                <span>
                  {progress.completed}/{progress.total} chapitres
                </span>
                <span className="font-medium" style={{ color: progress.percentage > 0 ? course.color : undefined }}>
                  {progress.percentage}%
                </span>
              </div>
              <Progress value={progress.percentage} color={course.color} />
            </div>
          )}
        </Card>
      </motion.div>
    </Link>
  )
}
