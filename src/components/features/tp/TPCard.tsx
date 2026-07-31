'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Task01Icon, CheckmarkCircle02Icon, ListViewIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TP } from '@/domain'

export function TPCard({ tp }: { tp: TP }) {
  const isDone = Boolean(tp.completedAt)

  return (
    <Link href={`/tp/${tp.id}`} className="block h-full">
      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
        <Card className="h-full p-5 transition-colors hover:border-violet-nyx/50">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-purple/15 p-2.5">
              {isDone ? (
                <CheckmarkCircle02Icon size={20} className="text-green" />
              ) : (
                <Task01Icon size={20} className="text-purple" />
              )}
            </div>
            <Badge variant={isDone ? 'green' : 'outline'}>{isDone ? 'Terminé' : 'À faire'}</Badge>
          </div>
          <h3 className="mt-4 font-semibold text-text-primary">{tp.title}</h3>
          <p className="mt-1 text-sm text-text-secondary">{tp.environment}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <ListViewIcon size={14} /> {tp.steps.length} étapes
            </span>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
