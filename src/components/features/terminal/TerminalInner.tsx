'use client'

import { useRef } from 'react'
import { useTerminal } from '@/hooks/useTerminal'

/** xterm-backed terminal — loaded lazily on the client by `Terminal` to keep xterm out of the initial bundle. */
export default function TerminalInner({ wsUrl }: { wsUrl: string | null }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  useTerminal(containerRef, wsUrl)

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-lg border border-border bg-background p-2" />
}
