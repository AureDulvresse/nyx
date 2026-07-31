import { Rocket01Icon, GraduationScrollIcon, MedalFirstPlaceIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { SkillLevel } from '@/services'

const LEVEL_ICON = {
  novice: GraduationScrollIcon,
  apprenti: Rocket01Icon,
  intermediaire: MedalFirstPlaceIcon,
} as const

const LEVEL_COLOR = {
  novice: 'text-blue',
  apprenti: 'text-orange',
  intermediaire: 'text-green',
} as const

export function LevelCard({ skill }: { skill: SkillLevel }) {
  const Icon = LEVEL_ICON[skill.level]
  const color = LEVEL_COLOR[skill.level]

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${color === 'text-blue' ? 'bg-blue/15' : color === 'text-orange' ? 'bg-orange/15' : 'bg-green/15'}`}>
          <Icon size={24} className={color} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-secondary">Ton niveau</p>
          <p className={`text-lg font-bold ${color}`}>{skill.label}</p>
          <p className="mt-1 text-sm text-text-secondary">{skill.description}</p>

          {skill.nextThreshold !== null && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-text-secondary">
                <span>Progression vers le niveau suivant</span>
                <span>{Math.min(100, Math.max(0, skill.progressToNext))}%</span>
              </div>
              <Progress value={skill.progressToNext} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
