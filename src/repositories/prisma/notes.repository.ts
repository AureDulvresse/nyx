import { prisma } from '@/lib/prisma'
import type { INotesRepository } from '../interfaces'
import type { ChapterNoteItem, CommentWithContext } from '@/domain'

export class PrismaNotesRepository implements INotesRepository {
  async findAllChapterNotes(): Promise<ChapterNoteItem[]> {
    const chapters = await prisma.chapter.findMany({
      where: { notes: { not: null } },
      include: { course: true },
      orderBy: { updatedAt: 'desc' },
    })
    return chapters
      .filter((c) => c.notes && c.notes.trim().length > 0)
      .map((c) => ({
        chapterId: c.id,
        chapterNumber: c.number,
        chapterTitle: c.title,
        courseSlug: c.course.slug,
        courseTitle: c.course.title,
        notes: c.notes!,
        updatedAt: c.updatedAt,
      }))
  }

  async findAllComments(): Promise<CommentWithContext[]> {
    const comments = await prisma.comment.findMany({
      include: { chapter: { include: { course: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return comments.map((c) => ({
      id: c.id,
      chapterId: c.chapterId,
      chapterNumber: c.chapter.number,
      chapterTitle: c.chapter.title,
      courseSlug: c.chapter.course.slug,
      courseTitle: c.chapter.course.title,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt,
    }))
  }
}
