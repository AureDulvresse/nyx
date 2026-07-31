'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { projectRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { Project } from '@/domain'
import {
  CreateProjectSchema,
  UpdateProjectStatusSchema,
  UpdateProjectNotesSchema,
  DeleteProjectSchema,
  UpdateProjectStepsSchema,
  AdoptProjectSchema,
} from '@/lib/schemas'

export async function createPersonalProject(input: z.infer<typeof CreateProjectSchema>): Promise<ActionResult<Project>> {
  const v = CreateProjectSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const project = await projectRepo.create({
      title: v.data.title,
      description: v.data.description,
      category: v.data.category,
      resourceUrl: v.data.resourceUrl || undefined,
    })
    revalidatePath('/projects')
    return ok(project)
  } catch {
    return err('Failed to create project', 'DB_ERROR')
  }
}

export async function updateProjectStatus(input: z.infer<typeof UpdateProjectStatusSchema>): Promise<ActionResult<Project>> {
  const v = UpdateProjectStatusSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const project = await projectRepo.updateStatus(v.data.projectId, v.data.status)
    revalidatePath('/projects')
    return ok(project)
  } catch {
    return err('Failed to update project status', 'DB_ERROR')
  }
}

export async function updateProjectNotes(input: z.infer<typeof UpdateProjectNotesSchema>): Promise<ActionResult<Project>> {
  const v = UpdateProjectNotesSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const project = await projectRepo.updateNotes(v.data.projectId, v.data.notes)
    revalidatePath('/projects')
    return ok(project)
  } catch {
    return err('Failed to update project notes', 'DB_ERROR')
  }
}

export async function deleteProject(input: z.infer<typeof DeleteProjectSchema>): Promise<ActionResult> {
  const v = DeleteProjectSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    await projectRepo.delete(v.data.projectId)
    revalidatePath('/projects')
    return ok(undefined)
  } catch {
    return err('Failed to delete project', 'DB_ERROR')
  }
}

export async function updateProjectSteps(input: z.infer<typeof UpdateProjectStepsSchema>): Promise<ActionResult<Project>> {
  const v = UpdateProjectStepsSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const project = await projectRepo.updateSteps(v.data.projectId, v.data.steps)
    revalidatePath('/projects')
    return ok(project)
  } catch {
    return err('Failed to update project steps', 'DB_ERROR')
  }
}

export async function adoptProject(input: z.infer<typeof AdoptProjectSchema>): Promise<ActionResult<Project>> {
  const v = AdoptProjectSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const source = await projectRepo.findById(v.data.projectId)
    if (!source) return err('Project not found', 'NOT_FOUND')

    const project = await projectRepo.create({
      title: source.title,
      description: source.description,
      category: source.category,
      resourceUrl: source.resourceUrl ?? undefined,
      linkedCourses: source.linkedCourses,
      steps: source.steps,
    })
    revalidatePath('/projects')
    return ok(project)
  } catch {
    return err('Failed to adopt project', 'DB_ERROR')
  }
}
