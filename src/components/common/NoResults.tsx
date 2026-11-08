import type { ReactNode } from 'react'

/** Inline "nothing matches" message for filtered lists (see EmptyState for the richer variant). */
export function NoResults({ children }: { children: ReactNode }): React.JSX.Element {
  return <p className="py-10 text-center text-text-secondary">{children}</p>
}
