'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckmarkCircle02Icon, ArrowRight01Icon } from 'hugeicons-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { Chapter } from '@/domain'

export function ChapterList({ courseSlug, chapters }: { courseSlug: string; chapters: Chapter[] }) {
  return (
    <div className="relative space-y-3">
      {chapters.map((chapter, i) => {
        const isCompleted = chapter.status === 'completed'
        const isLast = i === chapters.length - 1

        return (
          <div key={chapter.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  isCompleted ? 'bg-green text-[#0d1117]' : 'bg-surface text-text-secondary ring-1 ring-border'
                )}
              >
                {isCompleted ? <CheckmarkCircle02Icon size={18} /> : chapter.number}
              </span>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>

            <Link href={`/courses/${courseSlug}/${chapter.number}`} className="min-w-0 flex-1 pb-1">
              <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <Card className="group flex items-center justify-between p-4 transition-colors hover:border-violet-nyx/50">
                  <span className="font-medium text-text-primary">{chapter.title}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={chapter.status} />
                    <ArrowRight01Icon
                      size={16}
                      className="text-text-secondary opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
