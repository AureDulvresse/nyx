'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LinkSquare01Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PROJECT_CATEGORY_CONFIG, PROJECT_STATUS_LABELS } from '@/lib/project-category'
import type { Project, ProjectStatus } from '@/domain'

const STATUS_VARIANT: Record<ProjectStatus, 'outline' | 'orange' | 'green'> = {
  idea: 'outline',
  in_progress: 'orange',
  completed: 'green',
}

export function ProjectCard({ project }: { project: Project }) {
  const category = PROJECT_CATEGORY_CONFIG[project.category]
  const Icon = category.icon

  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
        <Card className="h-full p-5 transition-colors hover:border-violet-nyx/50">
          <div className="flex items-start justify-between gap-2">
            <div className={`rounded-lg p-2.5 ${category.bg}`}>
              <Icon size={20} className={category.color} />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="outline">{category.label}</Badge>
              <span className="text-[11px] text-text-secondary">
                {project.type === 'proposed' ? 'Idée proposée' : 'Projet personnel'}
              </span>
            </div>
          </div>

          <h3 className="mt-3 font-semibold text-text-primary">{project.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-text-secondary">{project.description}</p>

          {project.linkedCourses.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.linkedCourses.map((slug) => (
                <span key={slug} className="rounded-full bg-background px-2 py-0.5 text-[11px] text-text-secondary">
                  {slug}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Badge variant={STATUS_VARIANT[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
            <div className="flex items-center gap-2">
              {(project.steps?.length ?? 0) > 0 && (
                <span className="text-[11px] text-text-secondary">
                  {project.steps.filter((s) => s.completed).length}/{project.steps.length} étapes
                </span>
              )}
              {project.resourceUrl && <LinkSquare01Icon size={15} className="text-text-secondary" />}
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
