'use client'

import { useState } from 'react'
import { Copy01Icon, Tick01Icon, StarIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { CheatEntry } from '@/domain'

export function CommandCard({ entry, onToggleFavorite }: { entry: CheatEntry; onToggleFavorite?: (id: string) => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className="p-4 hover:border-violet-nyx/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-text-primary">{entry.title}</h4>
          {entry.subcategory && <Badge variant="outline" className="mt-1">{entry.subcategory}</Badge>}
        </div>
        <button
          onClick={() => onToggleFavorite?.(entry.id)}
          className="text-text-secondary hover:text-orange transition-colors"
          aria-label="Favori"
        >
          <StarIcon size={18} fill={entry.isFavorite ? 'currentColor' : 'none'} className={cn(entry.isFavorite && 'text-orange')} />
        </button>
      </div>

      <button
        onClick={handleCopy}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-md bg-background border border-border px-3 py-2 font-mono text-sm text-green hover:border-green/50 transition-colors text-left"
      >
        <code className="truncate">{entry.command}</code>
        {copied ? <Tick01Icon size={16} className="shrink-0 text-green" /> : <Copy01Icon size={16} className="shrink-0 text-text-secondary" />}
      </button>

      <p className="mt-2 text-sm text-text-secondary">{entry.description}</p>
    </Card>
  )
}
