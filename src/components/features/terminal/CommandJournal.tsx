'use client'

import { useEffect, useState } from 'react'
import { CommandLineIcon } from 'hugeicons-react'
import { getCommandLog } from '@/actions'
import type { CommandLogEntry } from '@/domain'

export function CommandJournal({ sessionId }: { sessionId: string }) {
  const [entries, setEntries] = useState<CommandLogEntry[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const result = await getCommandLog({ sessionId })
      if (!cancelled && result.success) setEntries(result.data)
    }
    load()
    const interval = setInterval(load, 4000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [sessionId])

  if (entries.length === 0) return null

  return (
    <details className="rounded-lg border border-border bg-surface">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-primary">
        <CommandLineIcon size={16} className="text-text-secondary" />
        Journal des commandes ({entries.length})
      </summary>
      <div className="max-h-48 overflow-y-auto border-t border-border px-4 py-3 font-mono text-xs">
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-2 py-0.5">
            <span className="shrink-0 text-text-secondary">{new Date(entry.executedAt).toLocaleTimeString('fr-FR')}</span>
            <span className="text-green">$</span>
            <span className="text-text-primary">{entry.command}</span>
          </div>
        ))}
      </div>
    </details>
  )
}
