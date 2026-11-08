'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KeyboardIcon } from 'hugeicons-react'
import { useKeydown } from '@/hooks/useKeydown'

/** ←/→ jump to the previous/next chapter; renders a small hint. */
export function ChapterKeyboardNav({
  previousHref,
  nextHref,
}: {
  previousHref: string | null
  nextHref: string | null
}): React.JSX.Element | null {
  const router = useRouter()

  // Warm the route cache so the keyboard jump is instant.
  useEffect(() => {
    if (previousHref) router.prefetch(previousHref)
    if (nextHref) router.prefetch(nextHref)
  }, [router, previousHref, nextHref])

  useKeydown((e) => {
    // Leave arrows alone while a modal is open (e.g. "marquer terminé ?" confirmation).
    if (document.querySelector('[aria-modal="true"]')) return
    const href = e.key === 'ArrowLeft' ? previousHref : e.key === 'ArrowRight' ? nextHref : null
    if (!href) return
    e.preventDefault()
    router.push(href)
  })

  if (!previousHref && !nextHref) return null

  return (
    <p className="hidden items-center justify-center gap-1.5 text-xs text-text-secondary lg:flex print:hidden">
      <KeyboardIcon size={14} />
      Astuce : <kbd className="rounded border border-border bg-surface px-1.5 font-mono">←</kbd>
      <kbd className="rounded border border-border bg-surface px-1.5 font-mono">→</kbd> pour changer de chapitre
    </p>
  )
}
