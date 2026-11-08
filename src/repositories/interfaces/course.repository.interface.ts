import type { Chapter, ChapterStatus, Course, CourseProgress, ResumePoint } from '@/domain'

export interface ICourseRepository {
  findAll(): Promise<Course[]>
  findById(id: string): Promise<Course | null>
  findBySlug(slug: string): Promise<Course | null>
  findWithChapters(slug: string): Promise<(Course & { chapters: Chapter[] }) | null>
  updateCoverImage(id: string, coverImage: string): Promise<Course>
}

export interface GlobalProgress {
  total: number
  completed: number
  percentage: number
}

export interface IChapterRepository {
  findById(id: string): Promise<Chapter | null>
  findByCourse(courseId: string): Promise<Chapter[]>
  updateStatus(id: string, status: ChapterStatus): Promise<Chapter>
  /** Moves a chapter from not_started to in_progress; no-op otherwise. Returns true if it changed. */
  markStarted(id: string): Promise<boolean>
  updateNotes(id: string, notes: string): Promise<Chapter>
  markReviewed(id: string): Promise<Chapter>
  getGlobalProgress(): Promise<GlobalProgress>
  getProgressByCourse(courseId: string): Promise<CourseProgress>
  getAllCourseProgress(): Promise<CourseProgress[]>
  findResumePoint(): Promise<ResumePoint | null>
}
