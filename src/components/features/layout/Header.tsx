import { StreakBadge } from '@/components/common/StreakBadge'
import { CreditsBadge } from '@/components/common/CreditsBadge'
import { PointsBadge } from '@/components/common/PointsBadge'
import { LogoutButton } from '@/components/common/LogoutButton'
import { CommandPalette } from '@/components/features/search/CommandPalette'
import { MobileNav } from './MobileNav'

export function Header({
  streak = 0,
  credits = { earned: 0, total: 0 },
  points = 0,
}: {
  streak?: number
  credits?: { earned: number; total: number }
  points?: number
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:px-8 print:hidden">
      <MobileNav />
      <div className="hidden lg:block">
        <CommandPalette />
      </div>
      <div className="flex items-center gap-3">
        <PointsBadge points={points} />
        <CreditsBadge earned={credits.earned} total={credits.total} />
        <StreakBadge days={streak} />
        <LogoutButton />
      </div>
    </header>
  )
}
