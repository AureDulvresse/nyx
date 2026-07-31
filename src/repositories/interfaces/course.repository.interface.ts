import type { Chapter, ChapterStatus, Course, CourseProgress } from '@/domain'

export interface ICourseRepository {
  findAll(): Promise<Course[]>
  findBySlug(slug: string): Promise<Course | null>
  findWithChapters(slug: string): Promise<(Course & { chapters: Chapter[] }) | null>
  updateCoverImage(id: string, coverImage: string): Promise<Course>
}

export interface IChapterRepository {
  findById(id: string): Promise<Chapter | null>
  findByCourse(courseId: string): Promise<Chapter[]>
  updateStatus(id: string, status: ChapterStatus): Promise<Chapter>
  updateNotes(id: string, notes: string): Promise<Chapter>
  markReviewed(id: string): Promise<Chapter>
  getGlobalProgress(): Promise<{ total: number; completed: number; percentage: number }>
  getProgressByCourse(courseId: string): Promise<CourseProgress>
}
