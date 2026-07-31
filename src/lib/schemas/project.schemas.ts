import { z } from 'zod'

export const ProjectCategorySchema = z.enum(['pentest', 'recherche', 'rapport', 'automatisation', 'ctf', 'veille', 'developpement'])

export const CreateProjectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(1).max(5000),
  category: ProjectCategorySchema,
  resourceUrl: z.string().url().max(500).optional().or(z.literal('')),
})

export const UpdateProjectStatusSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(['idea', 'in_progress', 'completed']),
})

export const UpdateProjectNotesSchema = z.object({
  projectId: z.string().min(1),
  notes: z.string().max(10_000),
})

export const DeleteProjectSchema = z.object({
  projectId: z.string().min(1),
})

export const ProjectStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  completed: z.boolean(),
})

export const UpdateProjectStepsSchema = z.object({
  projectId: z.string().min(1),
  steps: z.array(ProjectStepSchema).max(30),
})

export const AdoptProjectSchema = z.object({
  projectId: z.string().min(1),
})
