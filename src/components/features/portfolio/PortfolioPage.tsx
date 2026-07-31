import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrintButton } from './PrintButton'
import { DateUtils } from '@/lib/utils/date.utils'
import type { CompletedLabSession, Project, Certification } from '@/domain'

const CERT_STATUS_LABELS: Record<string, string> = {
  not_started: 'Non commencée',
  in_progress: 'En cours',
  completed: 'Obtenue',
}

export function PortfolioPage({
  completedLabs,
  completedProjects,
  certifications,
  credits,
}: {
  completedLabs: CompletedLabSession[]
  completedProjects: Project[]
  certifications: Certification[]
  credits: { earned: number; total: number }
}) {
  const activeCerts = certifications.filter((c) => c.status !== 'not_started')
  const totalPoints = completedLabs.reduce((sum, l) => sum + l.score + l.bonusPoints, 0)

  return (
    <div className="space-y-8 print:space-y-6">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <PageHeader
          title="Portfolio"
          description="Un récapitulatif exportable de tes labs, projets et certifications — utile pour candidater ou suivre ta progression."
        />
        <PrintButton />
      </div>

      <div className="hidden border-b border-border pb-4 print:block">
        <h1 className="text-2xl font-bold text-text-primary">Portfolio Nyx — Aure Dulvresse</h1>
        <p className="text-sm text-text-secondary">Généré le {DateUtils.format(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{completedLabs.length}</p>
          <p className="text-xs text-text-secondary">Labs terminés</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{totalPoints}</p>
          <p className="text-xs text-text-secondary">Points de labs</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{completedProjects.length}</p>
          <p className="text-xs text-text-secondary">Projets terminés</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{credits.earned}/{credits.total}</p>
          <p className="text-xs text-text-secondary">Crédits acquis</p>
        </Card>
      </div>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle>Labs terminés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {completedLabs.length === 0 && <p className="text-sm text-text-secondary">Aucun lab terminé pour le moment.</p>}
          {completedLabs.map((lab) => (
            <div key={lab.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">{lab.labTitle}</p>
                <p className="text-xs text-text-secondary">
                  {lab.labCategory} · terminé le {DateUtils.format(lab.completedAt)}
                </p>
              </div>
              <Badge variant="green">{lab.score + lab.bonusPoints} pts</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle>Projets terminés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {completedProjects.length === 0 && <p className="text-sm text-text-secondary">Aucun projet terminé pour le moment.</p>}
          {completedProjects.map((project) => (
            <div key={project.id} className="rounded-md border border-border px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-text-primary">{project.title}</p>
                {project.completedAt && (
                  <span className="shrink-0 text-xs text-text-secondary">{DateUtils.format(project.completedAt)}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-secondary">{project.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeCerts.length === 0 && <p className="text-sm text-text-secondary">Aucune certification en cours ou obtenue.</p>}
          {activeCerts.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">{cert.name}</p>
                <p className="text-xs text-text-secondary">{cert.provider}</p>
              </div>
              <Badge variant={cert.status === 'completed' ? 'green' : 'orange'}>
                {CERT_STATUS_LABELS[cert.status]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
