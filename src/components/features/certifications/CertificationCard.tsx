'use client'

import { motion } from 'framer-motion'
import { Certificate01Icon, BookOpen01Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Certification } from '@/domain'

const STATUS_VARIANT: Record<string, 'green' | 'blue' | 'outline'> = {
  completed: 'green',
  in_progress: 'blue',
  not_started: 'outline',
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Obtenue',
  in_progress: 'En préparation',
  not_started: 'À venir',
}

function readinessColor(readiness: number): string {
  if (readiness >= 70) return 'bg-green'
  if (readiness >= 30) return 'bg-orange'
  return 'bg-red'
}

export function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange/15 p-2.5">
              <Certificate01Icon size={20} className="text-orange" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">{cert.name}</p>
              <p className="text-sm text-text-secondary">{cert.provider}</p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[cert.status]}>{STATUS_LABELS[cert.status] ?? cert.status}</Badge>
        </div>

        {cert.readiness !== undefined && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
              <span>Préparation</span>
              <span className="font-medium text-text-primary">{cert.readiness}%</span>
            </div>
            <Progress value={cert.readiness} colorClassName={readinessColor(cert.readiness)} />
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
          <BookOpen01Icon size={14} />
          {cert.linkedCourses.length} cours associé{cert.linkedCourses.length > 1 ? 's' : ''}
        </div>
      </Card>
    </motion.div>
  )
}
