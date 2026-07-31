export interface ChapterNoteItem {
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  courseSlug: string
  courseTitle: string
  notes: string
  updatedAt: Date
}

export interface CommentWithContext {
  id: string
  chapterId: string
  chapterNumber: number
  chapterTitle: string
  courseSlug: string
  courseTitle: string
  author: string
  content: string
  createdAt: Date
}
