'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock01Icon, Award01Icon, Flag03Icon, CheckmarkCircle02Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LAB_DIFFICULTY_LABELS } from '@/lib/constants'
import { LAB_CATEGORY_CONFIG } from '@/lib/lab-category'
import type { Lab } from '@/domain'

const DIFFICULTY_VARIANT: Record<string, 'green' | 'orange' | 'red'> = {
  beginner: 'green',
  intermediate: 'orange',
  advanced: 'red',
}

export function LabCard({ lab, pointsEarned }: { lab: Lab; pointsEarned?: number }) {
  const category = LAB_CATEGORY_CONFIG[lab.category] ?? LAB_CATEGORY_CONFIG.exploitation
  const Icon = category.icon
  const completed = pointsEarned !== undefined

  return (
    <Link href={`/labs/${lab.id}`} className="block h-full">
      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
        <Card
          className={`group relative h-full overflow-hidden p-5 transition-colors hover:border-violet-nyx/50 ${
            completed ? 'border-green/30' : ''
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:linear-gradient(120deg,transparent_20%,rgba(124,58,237,0.12)_50%,transparent_80%)]" />
          <div className="relative flex items-start justify-between">
            <div className={`rounded-lg p-2.5 ${category.bg}`}>
              <Icon size={20} className={category.color} />
            </div>
            <div className="flex items-center gap-2">
              {completed && (
                <Badge variant="green" className="flex items-center gap-1">
                  <CheckmarkCircle02Icon size={12} /> Complété
                </Badge>
              )}
              <Badge variant={DIFFICULTY_VARIANT[lab.difficulty]}>{LAB_DIFFICULTY_LABELS[lab.difficulty]}</Badge>
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <Badge variant="outline">{category.label}</Badge>
          </div>
          <h3 className="relative mt-2 font-semibold text-text-primary">{lab.title}</h3>
          <p className="relative mt-1 line-clamp-2 text-sm text-text-secondary">{lab.description}</p>
          <div className="relative mt-4 flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock01Icon size={14} /> {lab.estimatedTime} min
            </span>
            <span className="flex items-center gap-1">
              <Award01Icon size={14} /> {completed ? `${pointsEarned} / ${lab.totalPoints}` : lab.totalPoints} pts
            </span>
            <span className="flex items-center gap-1">
              <Flag03Icon size={14} /> {lab.flags?.length ?? 0}
            </span>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
