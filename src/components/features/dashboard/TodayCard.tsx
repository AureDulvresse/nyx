import Link from 'next/link'
import { ArrowRight01Icon, BookOpen01Icon, Cards01Icon, Alert02Icon, Sun03Icon, Compass01Icon, FireIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { TodayPlan, TodayTaskKind } from '@/services/today.service'

const KIND_STYLE: Record<TodayTaskKind, { icon: typeof Cards01Icon; className: string }> = {
  flashcards: { icon: Cards01Icon, className: 'bg-teal/15 text-teal' },
  resume: { icon: BookOpen01Icon, className: 'bg-violet-nyx/15 text-purple' },
  weak: { icon: Alert02Icon, className: 'bg-orange/15 text-orange' },
  explore: { icon: Compass01Icon, className: 'bg-blue/15 text-blue' },
}

/** "Aujourd'hui" — the few concrete things worth doing in this session, in priority order. */
export function TodayCard({ plan }: { plan: TodayPlan }): React.JSX.Element {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-text-primary">
          <Sun03Icon size={18} className="text-orange" aria-hidden /> Aujourd&apos;hui
        </h2>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
            plan.studiedToday ? 'bg-green/15 text-green' : 'bg-background text-text-secondary'
          )}
        >
          <FireIcon size={12} aria-hidden />
          {plan.studiedToday
            ? `Série : ${plan.streak} j`
            : plan.streak > 0
              ? `Garde ta série (${plan.streak} j)`
              : 'Pas encore étudié'}
        </span>
      </div>

      <ol className="space-y-2">
        {plan.tasks.map((task, i) => {
          const style = KIND_STYLE[task.kind]
          return (
            <li key={task.kind}>
              <Link
                href={task.href}
                className={cn(
                  'group flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 transition-colors hover:border-violet-nyx/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-nyx'
                )}
              >
                <span className={cn('rounded-md p-1.5', style.className)}>
                  <style.icon size={16} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-primary">
                    <span className="sr-only">Étape {i + 1} : </span>
                    {task.title}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">{task.description}</span>
                </span>
                <ArrowRight01Icon
                  size={14}
                  aria-hidden
                  className="shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
