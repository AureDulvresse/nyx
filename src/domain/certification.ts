export type CertificationStatus = 'not_started' | 'in_progress' | 'completed'

export interface Certification {
  id: string
  slug: string
  name: string
  provider: string
  status: CertificationStatus
  targetDate?: Date | null
  completedDate?: Date | null
  notes?: string | null
  linkedCourses: string[]
  priority: number
  readiness?: number
}
