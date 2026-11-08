import Link from 'next/link'
import { CheckmarkCircle02Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ExamCooldownCard({ courseSlug }: { courseSlug: string }): React.JSX.Element {
  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center">
      <CheckmarkCircle02Icon size={32} className="text-green" />
      <div>
        <p className="font-medium text-text-primary">Examen déjà réussi aujourd&apos;hui</p>
        <p className="mt-1 text-sm text-text-secondary">
          Tu peux le repasser (pour t&apos;entraîner ou améliorer ton score) à partir de demain.
        </p>
      </div>
      <Link href={`/courses/${courseSlug}`}>
        <Button variant="secondary">Retour au cours</Button>
      </Link>
    </Card>
  )
}
