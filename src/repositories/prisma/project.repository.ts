import { prisma } from '@/lib/prisma'
import type { IProjectRepository } from '../interfaces'
import type { Project, ProjectCategory, ProjectStatus, ProjectStep } from '@/domain'

function normalize(project: unknown): Project {
  const p = project as Project
  return { ...p, steps: Array.isArray(p.steps) ? p.steps : [], linkedCourses: Array.isArray(p.linkedCourses) ? p.linkedCourses : [] }
}

export class PrismaProjectRepository implements IProjectRepository {
  async findAll(): Promise<Project[]> {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
    return projects.map(normalize)
  }

  async findById(id: string): Promise<Project | null> {
    const project = await prisma.project.findUnique({ where: { id } })
    return project ? normalize(project) : null
  }

  async create(input: {
    title: string
    description: string
    category: ProjectCategory
    resourceUrl?: string
    linkedCourses?: string[]
    steps?: ProjectStep[]
  }): Promise<Project> {
    const { linkedCourses, steps, ...rest } = input
    const project = await prisma.project.create({
      data: { ...rest, type: 'personal', linkedCourses: linkedCourses ?? [], steps: (steps ?? []) as object },
    })
    return normalize(project)
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    const project = await prisma.project.update({
      where: { id },
      data: { status, completedAt: status === 'completed' ? new Date() : null },
    })
    return normalize(project)
  }

  async updateNotes(id: string, notes: string): Promise<Project> {
    const project = await prisma.project.update({ where: { id }, data: { notes } })
    return normalize(project)
  }

  async updateSteps(id: string, steps: ProjectStep[]): Promise<Project> {
    const project = await prisma.project.update({ where: { id }, data: { steps: steps as object } })
    return normalize(project)
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  }
}
