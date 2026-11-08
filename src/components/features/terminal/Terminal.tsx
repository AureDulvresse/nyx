'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/common/Skeleton'

// xterm (+ addons + CSS) only runs in the browser: load it lazily, client-side only.
const TerminalInner = dynamic(() => import('./TerminalInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg border border-border" />,
})

export function Terminal({ wsUrl }: { wsUrl: string | null }): React.JSX.Element {
  return <TerminalInner wsUrl={wsUrl} />
}
