import { IncognitoIcon, Search01Icon, DocumentValidationIcon, Task01Icon, Flag03Icon, Note01Icon, SourceCodeIcon } from 'hugeicons-react'
import type { ProjectCategory } from '@/domain'

export const PROJECT_CATEGORY_CONFIG: Record<
  ProjectCategory,
  { icon: typeof IncognitoIcon; color: string; bg: string; label: string }
> = {
  pentest: { icon: IncognitoIcon, color: 'text-red', bg: 'bg-red/15', label: 'Pentest' },
  recherche: { icon: Search01Icon, color: 'text-blue', bg: 'bg-blue/15', label: 'Recherche' },
  rapport: { icon: DocumentValidationIcon, color: 'text-teal', bg: 'bg-teal/15', label: 'Rapport' },
  automatisation: { icon: Task01Icon, color: 'text-orange', bg: 'bg-orange/15', label: 'Automatisation' },
  ctf: { icon: Flag03Icon, color: 'text-purple', bg: 'bg-purple/15', label: 'CTF' },
  veille: { icon: Note01Icon, color: 'text-green', bg: 'bg-green/15', label: 'Veille' },
  developpement: { icon: SourceCodeIcon, color: 'text-teal', bg: 'bg-teal/15', label: 'Développement' },
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  idea: 'Idée',
  in_progress: 'En cours',
  completed: 'Terminé',
}
