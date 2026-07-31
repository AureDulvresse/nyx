import type { Comment, Resource, ResourceType } from '@/domain'

export interface ICommentRepository {
  findByChapter(chapterId: string): Promise<Comment[]>
  create(chapterId: string, author: string, content: string): Promise<Comment>
  delete(id: string): Promise<void>
}

export interface IResourceRepository {
  findByChapter(chapterId: string): Promise<Resource[]>
  create(input: {
    chapterId: string
    title: string
    url: string
    type: ResourceType
    note?: string
    isCurated?: boolean
  }): Promise<Resource>
  delete(id: string): Promise<void>
}
