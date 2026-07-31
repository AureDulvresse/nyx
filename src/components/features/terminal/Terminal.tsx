'use client'

import { useRef } from 'react'
import { useTerminal } from '@/hooks/useTerminal'

export function Terminal({ wsUrl }: { wsUrl: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useTerminal(containerRef, wsUrl)

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-lg border border-border bg-background p-2" />
}
