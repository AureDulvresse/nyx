export interface ActivityDay {
  date: string
  count: number
}

export interface ProgressionInput {
  chaptersCompleted: number
  quizzesPassed: number
  tpsCompleted: number
  labsCompleted: number
  projectsCompleted: number
}

export interface SkillLevel {
  level: 'novice' | 'apprenti' | 'intermediaire'
  label: string
  description: string
  score: number
  nextThreshold: number | null
  progressToNext: number
}
