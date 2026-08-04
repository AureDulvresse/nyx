import Link from 'next/link'
import { Rocket01Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Course } from '@/domain'

export function OnboardingBanner({ firstCourse }: { firstCourse: Course | null }) {
  if (!firstCourse) return null

  return (
    <Card className="flex flex-col items-start gap-4 border-violet-nyx/40 bg-violet-nyx/5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-violet-nyx/15 p-2.5">
          <Rocket01Icon size={20} className="text-purple" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">Bienvenue sur Nyx</p>
          <p className="mt-1 text-sm text-text-secondary">
            Tu n&apos;as encore commencé aucun chapitre — le plus simple est de démarrer par{' '}
            <strong className="text-text-primary">{firstCourse.title}</strong>.
          </p>
        </div>
      </div>
      <Link href={`/courses/${firstCourse.slug}`} className="shrink-0">
        <Button>Commencer ce cours</Button>
      </Link>
    </Card>
  )
}
