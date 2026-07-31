import type { Project, ProjectCategory, ProjectStatus, ProjectStep } from '@/domain'

export interface IProjectRepository {
  findAll(): Promise<Project[]>
  findById(id: string): Promise<Project | null>
  create(input: {
    title: string
    description: string
    category: ProjectCategory
    resourceUrl?: string
    linkedCourses?: string[]
    steps?: ProjectStep[]
  }): Promise<Project>
  updateStatus(id: string, status: ProjectStatus): Promise<Project>
  updateNotes(id: string, notes: string): Promise<Project>
  updateSteps(id: string, steps: ProjectStep[]): Promise<Project>
  delete(id: string): Promise<void>
}
