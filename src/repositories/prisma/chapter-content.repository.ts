import { prisma } from '@/lib/prisma'
import type { ICommentRepository, IResourceRepository } from '../interfaces'
import type { Comment, Resource, ResourceType } from '@/domain'

export class PrismaCommentRepository implements ICommentRepository {
  async findByChapter(chapterId: string): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({ where: { chapterId }, orderBy: { createdAt: 'asc' } })
    return comments as unknown as Comment[]
  }

  async create(chapterId: string, author: string, content: string): Promise<Comment> {
    const comment = await prisma.comment.create({ data: { chapterId, author, content } })
    return comment as unknown as Comment
  }

  async delete(id: string): Promise<void> {
    await prisma.comment.delete({ where: { id } })
  }
}

export class PrismaResourceRepository implements IResourceRepository {
  async findByChapter(chapterId: string): Promise<Resource[]> {
    const resources = await prisma.resource.findMany({ where: { chapterId }, orderBy: { createdAt: 'asc' } })
    return resources as unknown as Resource[]
  }

  async create(input: { chapterId: string; title: string; url: string; type: ResourceType; note?: string }): Promise<Resource> {
    const resource = await prisma.resource.create({ data: input })
    return resource as unknown as Resource
  }

  async delete(id: string): Promise<void> {
    await prisma.resource.delete({ where: { id } })
  }
}
