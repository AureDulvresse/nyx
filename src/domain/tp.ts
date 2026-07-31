export interface TPStep {
  title: string
  description: string
  code?: string
  completed?: boolean
}

export interface TP {
  id: string
  chapterId: string
  title: string
  environment: string
  objectives: string[]
  steps: TPStep[]
  notes?: string | null
  completedAt?: Date | null
}
