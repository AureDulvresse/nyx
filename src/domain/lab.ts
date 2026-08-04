export type LabCategory = 'web' | 'network' | 'exploitation' | 'dfir' | 'ad' | 'crypto' | 'soc' | 'ds' | 'osint' | 'devops'
export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type LabSessionStatus = 'active' | 'completed' | 'failed' | 'expired'

export interface DockerTarget {
  name: string
  image: string
  ip: string
  hostname?: string
}

export interface Lab {
  id: string
  slug: string
  title: string
  category: LabCategory
  difficulty: LabDifficulty
  estimatedTime: number
  totalPoints: number
  description: string
  mdPath: string
  targets: DockerTarget[]
  kaliImage: string
  prerequisites: string[]
  published: boolean
  flags?: LabFlag[]
}

export interface LabFlag {
  id: string
  labId: string
  flagId: string
  hint: string
  value: string
  points: number
}

export interface LabSession {
  id: string
  labId: string
  kaliId: string
  networkId: string
  status: LabSessionStatus
  score: number
  bonusPoints: number
  startedAt: Date
  completedAt?: Date | null
}

export interface CompletedLabSession {
  id: string
  labId: string
  labSlug: string
  labTitle: string
  labCategory: LabCategory
  score: number
  bonusPoints: number
  startedAt: Date
  completedAt: Date
}

export interface FlagSubmitResult {
  success: boolean
  flagId?: string
  points?: number
  labCompleted?: boolean
  totalScore?: number
  bonusPoints?: number
}

// Client-safe view of a flag: never carries `hint` or `value` — those stay server-side so a
// locked hint can't just be read out of the page's props/HTML before it's paid for.
export interface LabFlagPublic {
  id: string
  flagId: string
  points: number
}

export interface HintUnlockResult {
  hint: string
  penalty: number
  alreadyUnlocked: boolean
}
