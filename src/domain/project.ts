export type ProjectType = 'proposed' | 'personal'
export type ProjectStatus = 'idea' | 'in_progress' | 'completed'
export type ProjectCategory = 'pentest' | 'recherche' | 'rapport' | 'automatisation' | 'ctf' | 'veille' | 'developpement'

export interface ProjectStep {
  id: string
  title: string
  completed: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  type: ProjectType
  category: ProjectCategory
  status: ProjectStatus
  linkedCourses: string[]
  steps: ProjectStep[]
  notes?: string | null
  resourceUrl?: string | null
  createdAt: Date
  updatedAt: Date
  completedAt?: Date | null
}
