import type { ChapterNoteItem, CommentWithContext } from '@/domain'

export interface INotesRepository {
  findAllChapterNotes(): Promise<ChapterNoteItem[]>
  findAllComments(): Promise<CommentWithContext[]>
}
