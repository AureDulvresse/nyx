import Link from 'next/link'
import { HelpCircleIcon, Task01Icon, IncognitoIcon, ArrowRight01Icon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import type { Quiz, TP } from '@/domain'

export function PracticeLinks({ quiz, tp }: { quiz: Quiz | null; tp: TP | null }) {
  const links = [
    quiz && {
      href: `/quiz/${quiz.chapterId}`,
      icon: HelpCircleIcon,
      color: 'text-blue',
      bg: 'bg-blue/15',
      title: 'Quiz de ce chapitre',
      description: `${quiz.questions.length} questions pour valider tes acquis`,
    },
    tp && {
      href: `/tp/${tp.id}`,
      icon: Task01Icon,
      color: 'text-purple',
      bg: 'bg-purple/15',
      title: 'TP associé',
      description: tp.title,
    },
    {
      href: '/labs',
      icon: IncognitoIcon,
      color: 'text-red',
      bg: 'bg-red/15',
      title: 'Labs pratiques',
      description: 'Mets ces notions en pratique dans un environnement réel',
    },
  ].filter(Boolean) as { href: string; icon: typeof HelpCircleIcon; color: string; bg: string; title: string; description: string }[]

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-text-primary">Continuer avec la pratique</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href + link.title} href={link.href}>
            <Card className="flex h-full items-start justify-between gap-3 p-4 transition-colors hover:border-violet-nyx/50">
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${link.bg}`}>
                  <link.icon size={18} className={link.color} />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{link.title}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{link.description}</p>
                </div>
              </div>
              <ArrowRight01Icon size={16} className="mt-1 shrink-0 text-text-secondary" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
