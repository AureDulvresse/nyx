import { prisma } from '@/lib/prisma'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'
import type { ICourseRepository, IChapterRepository } from '../interfaces'
import type { Chapter, ChapterStatus, Course, CourseProgress } from '@/domain'

export class PrismaCourseRepository implements ICourseRepository {
  async findAll(): Promise<Course[]> {
    const cached = await cacheService.get<Course[]>(CACHE_KEYS.courses)
    if (cached) return cached

    const courses = await prisma.course.findMany({ orderBy: { order: 'asc' } })
    await cacheService.set(CACHE_KEYS.courses, courses, CACHE_TTL.courses)
    return courses as unknown as Course[]
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const cached = await cacheService.get<Course>(CACHE_KEYS.course(slug))
    if (cached) return cached

    const course = await prisma.course.findUnique({ where: { slug } })
    if (course) await cacheService.set(CACHE_KEYS.course(slug), course, CACHE_TTL.courses)
    return course as unknown as Course | null
  }

  async findWithChapters(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { number: 'asc' } } },
    }) as unknown as Promise<(Course & { chapters: Chapter[] }) | null>
  }

  async updateCoverImage(id: string, coverImage: string): Promise<Course> {
    const course = await prisma.course.update({ where: { id }, data: { coverImage } })
    await cacheService.del(CACHE_KEYS.courses)
    await cacheService.del(CACHE_KEYS.course(course.slug))
    return course as unknown as Course
  }
}

export class PrismaChapterRepository implements IChapterRepository {
  async findById(id: string): Promise<Chapter | null> {
    return prisma.chapter.findUnique({ where: { id } }) as unknown as Promise<Chapter | null>
  }

  async findByCourse(courseId: string): Promise<Chapter[]> {
    return prisma.chapter.findMany({ where: { courseId }, orderBy: { number: 'asc' } }) as unknown as Promise<
      Chapter[]
    >
  }

  async updateStatus(id: string, status: ChapterStatus): Promise<Chapter> {
    const chapter = await prisma.chapter.update({
      where: { id },
      data: { status, completedAt: status === 'completed' ? new Date() : null },
    })
    await cacheService.del(CACHE_KEYS.courseProgress(chapter.courseId))
    await cacheService.del(CACHE_KEYS.globalProgress)
    return chapter as unknown as Chapter
  }

  async updateNotes(id: string, notes: string): Promise<Chapter> {
    return prisma.chapter.update({ where: { id }, data: { notes } }) as unknown as Promise<Chapter>
  }

  async markReviewed(id: string): Promise<Chapter> {
    return prisma.chapter.update({ where: { id }, data: { lastReviewedAt: new Date() } }) as unknown as Promise<Chapter>
  }

  async getGlobalProgress() {
    const cached = await cacheService.get<{ total: number; completed: number; percentage: number }>(
      CACHE_KEYS.globalProgress
    )
    if (cached) return cached

    const [total, completed] = await Promise.all([
      prisma.chapter.count(),
      prisma.chapter.count({ where: { status: 'completed' } }),
    ])
    const result = { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
    await cacheService.set(CACHE_KEYS.globalProgress, result, CACHE_TTL.progress)
    return result
  }

  async getProgressByCourse(courseId: string): Promise<CourseProgress> {
    const cached = await cacheService.get<CourseProgress>(CACHE_KEYS.courseProgress(courseId))
    if (cached) return cached

    const [course, total, completed] = await Promise.all([
      prisma.course.findUniqueOrThrow({ where: { id: courseId } }),
      prisma.chapter.count({ where: { courseId } }),
      prisma.chapter.count({ where: { courseId, status: 'completed' } }),
    ])

    const result: CourseProgress = {
      courseId,
      slug: course.slug,
      title: course.title,
      color: course.color,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
    await cacheService.set(CACHE_KEYS.courseProgress(courseId), result, CACHE_TTL.progress)
    return result
  }
}
