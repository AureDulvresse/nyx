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

const WEIGHTS = {
  chapter: 2,
  quiz: 3,
  tp: 5,
  lab: 10,
  project: 15,
} as const

const THRESHOLDS = {
  apprenti: 30,
  intermediaire: 80,
} as const

export function calculateScore(input: ProgressionInput): number {
  return (
    input.chaptersCompleted * WEIGHTS.chapter +
    input.quizzesPassed * WEIGHTS.quiz +
    input.tpsCompleted * WEIGHTS.tp +
    input.labsCompleted * WEIGHTS.lab +
    input.projectsCompleted * WEIGHTS.project
  )
}

export function calculateSkillLevel(input: ProgressionInput): SkillLevel {
  const score = calculateScore(input)

  if (score >= THRESHOLDS.intermediaire) {
    return {
      level: 'intermediaire',
      label: 'Intermédiaire',
      description: 'Tu maîtrises les fondamentaux et peux mener des missions de pentest de façon autonome.',
      score,
      nextThreshold: null,
      progressToNext: 100,
    }
  }

  if (score >= THRESHOLDS.apprenti) {
    return {
      level: 'apprenti',
      label: 'Apprenti',
      description: 'Les bases sont acquises — continue à enchaîner cours, quiz, TP et labs pour passer intermédiaire.',
      score,
      nextThreshold: THRESHOLDS.intermediaire,
      progressToNext: Math.round(((score - THRESHOLDS.apprenti) / (THRESHOLDS.intermediaire - THRESHOLDS.apprenti)) * 100),
    }
  }

  return {
    level: 'novice',
    label: 'Novice',
    description: 'Tu découvres les bases — termine des chapitres, quiz et TP pour progresser vers le niveau Apprenti.',
    score,
    nextThreshold: THRESHOLDS.apprenti,
    progressToNext: Math.round((score / THRESHOLDS.apprenti) * 100),
  }
}
