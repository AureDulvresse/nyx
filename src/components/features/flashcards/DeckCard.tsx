'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Cards01Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function DeckCard({ deck, dueCount, totalCount }: { deck: string; dueCount: number; totalCount: number }) {
  return (
    <Link href={`/flashcards/review?deck=${encodeURIComponent(deck)}`} className="block h-full">
      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
        <Card className="h-full p-5 transition-colors hover:border-violet-nyx/50">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-teal/15 p-2.5">
              <Cards01Icon size={20} className="text-teal" />
            </div>
            <Badge variant={dueCount > 0 ? 'teal' : 'outline'}>{dueCount} dues</Badge>
          </div>
          <h3 className="mt-4 font-semibold text-text-primary">{deck}</h3>
          <p className="mt-1 text-sm text-text-secondary">{totalCount} carte{totalCount > 1 ? 's' : ''} au total</p>
          {totalCount > 0 && (
            <div className="mt-4">
              <Progress value={((totalCount - dueCount) / totalCount) * 100} colorClassName="bg-teal" />
            </div>
          )}
        </Card>
      </motion.div>
    </Link>
  )
}
