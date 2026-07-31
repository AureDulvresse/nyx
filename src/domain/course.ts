export type ChapterStatus = 'not_started' | 'in_progress' | 'completed'
export type CourseCategory = 'Offensif' | 'Défensif' | 'Fondamentaux' | 'Data' | 'IA / Cyber' | 'Transversal'

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  category: CourseCategory
  icon: string
  color: string
  order: number
  credits: number
  coverImage?: string | null
  dependsOn: string[]
  chapters?: Chapter[]
  createdAt: Date
}

export interface Chapter {
  id: string
  courseId: string
  number: number
  title: string
  status: ChapterStatus
  completedAt?: Date | null
  notes?: string | null
  lastReviewedAt?: Date | null
}

export interface CourseProgress {
  courseId: string
  slug: string
  title: string
  color: string
  total: number
  completed: number
  percentage: number
}

export interface Comment {
  id: string
  chapterId: string
  author: string
  content: string
  createdAt: Date
}

export type ResourceType = 'link' | 'pdf' | 'video' | 'tool' | 'article' | 'image'

export interface Resource {
  id: string
  chapterId: string
  title: string
  url: string
  type: ResourceType
  note?: string | null
  isCurated: boolean
  createdAt: Date
}
