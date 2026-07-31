'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search01Icon,
  BookOpen01Icon,
  DocumentValidationIcon as ChapterIcon,
  SourceCodeSquareIcon as CheatIcon,
  IncognitoIcon as LabIcon,
} from 'hugeicons-react'
import { globalSearch } from '@/actions'
import type { SearchResultItem, SearchResultType } from '@/domain'

const TYPE_ICON: Record<SearchResultType, React.ComponentType<{ size?: number; className?: string }>> = {
  course: BookOpen01Icon,
  chapter: ChapterIcon,
  cheat: CheatIcon,
  lab: LabIcon,
}

const TYPE_LABEL: Record<SearchResultType, string> = {
  course: 'Cours',
  chapter: 'Chapitre',
  cheat: 'Cheatsheet',
  lab: 'Lab',
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      const result = await globalSearch({ query })
      if (result.success) {
        setResults(result.data)
        setActiveIndex(0)
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      navigateTo(results[activeIndex].href)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary lg:flex"
      >
        <Search01Icon size={16} />
        Rechercher...
        <kbd className="ml-4 rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-surface shadow-xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search01Icon size={18} className="text-text-secondary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Rechercher un cours, un chapitre, une commande, un lab..."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {query.trim().length >= 2 && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-text-secondary">Aucun résultat pour « {query} ».</p>
              )}
              {results.map((r, i) => {
                const Icon = TYPE_ICON[r.type]
                return (
                  <button
                    key={`${r.type}-${r.href}-${i}`}
                    onClick={() => navigateTo(r.href)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                      i === activeIndex ? 'bg-violet-nyx/15 text-purple' : 'text-text-primary hover:bg-background'
                    }`}
                  >
                    <Icon size={16} className="shrink-0 text-text-secondary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{r.title}</span>
                      {r.subtitle && <span className="block truncate text-xs text-text-secondary">{r.subtitle}</span>}
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-text-secondary">
                      {TYPE_LABEL[r.type]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
