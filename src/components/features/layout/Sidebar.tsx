'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DashboardSquare01Icon,
  BookOpen01Icon,
  Task01Icon,
  Cards01Icon,
  Search01Icon,
  Certificate01Icon,
  IncognitoIcon,
  ShieldKeyIcon,
  FolderLibraryIcon,
  RoadLocation01Icon,
  StickyNote02Icon,
  GitBranchIcon,
  Album02Icon,
} from 'hugeicons-react'
import { cn } from '@/lib/utils/cn'
import { NAV_SECTIONS } from '@/lib/constants'

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  DashboardSquare01Icon,
  BookOpen01Icon,
  Task01Icon,
  Cards01Icon,
  Search01Icon,
  Certificate01Icon,
  IncognitoIcon,
  FolderLibraryIcon,
  RoadLocation01Icon,
  StickyNote02Icon,
  GitBranchIcon,
  Album02Icon,
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface/50 lg:flex print:hidden">
      <div className="flex items-center gap-2 px-6 py-6">
        <ShieldKeyIcon size={26} className="text-violet-nyx" />
        <div>
          <p className="text-lg font-bold text-text-primary leading-none">Nyx</p>
          <p className="text-[11px] text-text-secondary">Master the night</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon]
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-violet-nyx/15 text-purple'
                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                    )}
                  >
                    {Icon && <Icon size={18} />}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4 text-center text-xs text-text-secondary">
        Aure Dulvresse · Pointe-Noire
      </div>
    </aside>
  )
}
