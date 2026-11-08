'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown01Icon, LeftToRightListBulletIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils/cn'
import type { MarkdownHeading } from '@/lib/utils/markdown.utils'

// Returns the id of the heading currently at the top of the reading area.
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // First heading (document order) inside the band; if none, keep the last one passed.
        const first = elements.find((el) => visible.has(el.id))
        if (first) {
          setActive(first.id)
          return
        }
        const passed = elements.filter((el) => el.getBoundingClientRect().top < 0)
        if (passed.length > 0) setActive(passed[passed.length - 1].id)
      },
      // Band = top ~40% of the viewport, below the sticky header.
      { rootMargin: '-64px 0px -60% 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

function TocLinks({
  headings,
  active,
  onNavigate,
}: {
  headings: MarkdownHeading[]
  active: string | null
  onNavigate?: () => void
}): React.JSX.Element {
  return (
    <ul className="space-y-0.5 border-l border-border text-sm">
      {headings.map((h) => {
        const isActive = h.id === active
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={onNavigate}
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 py-1 pr-2 leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx',
                h.level === 3 ? 'pl-6' : 'pl-3',
                isActive
                  ? 'border-violet-nyx font-medium text-purple'
                  : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
              )}
            >
              {h.text}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** Sticky "Sur cette page" column, shown on wide screens next to the chapter. */
export function ChapterTocDesktop({ headings }: { headings: MarkdownHeading[] }): React.JSX.Element | null {
  // Stable across re-renders that keep the same headings (RSC props get new array identities).
  const idKey = headings.map((h) => h.id).join('\n')
  const ids = useMemo(() => (idKey ? idKey.split('\n') : []), [idKey])
  const active = useActiveHeading(ids)
  if (headings.length < 2) return null

  return (
    <nav
      aria-label="Sommaire du chapitre"
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 self-start overflow-y-auto xl:block print:hidden"
    >
      <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        <LeftToRightListBulletIcon size={14} /> Sur cette page
      </p>
      <TocLinks headings={headings} active={active} />
    </nav>
  )
}

/** Collapsible table of contents shown above the content on smaller screens. */
export function ChapterTocMobile({ headings }: { headings: MarkdownHeading[] }): React.JSX.Element | null {
  const [open, setOpen] = useState(false)
  if (headings.length < 2) return null

  return (
    <nav aria-label="Sommaire du chapitre" className="mb-6 rounded-lg border border-border bg-surface xl:hidden print:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chapter-toc-mobile"
        className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx"
      >
        <span className="flex items-center gap-2">
          <LeftToRightListBulletIcon size={16} className="text-purple" /> Sommaire
          <span className="text-xs font-normal text-text-secondary">({headings.length} sections)</span>
        </span>
        <ArrowDown01Icon size={16} className={cn('text-text-secondary transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div id="chapter-toc-mobile" className="px-4 pb-3">
          <TocLinks headings={headings} active={null} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  )
}
