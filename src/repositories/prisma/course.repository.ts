import { prisma } from '@/lib/prisma'
import { cacheService, CACHE_KEYS, CACHE_TTL, STATS_CACHE_KEYS } from '@/infrastructure/cache'
import type { ICourseRepository, IChapterRepository, GlobalProgress } from '../interfaces'
import type { Chapter, ChapterStatus, Course, CourseProgress, ResumePoint } from '@/domain'
import { toPercentage } from '@/lib/utils/math.utils'

export class PrismaCourseRepository implements ICourseRepository {
  async findAll(): Promise<Course[]> {
    return cacheService.getOrSet(CACHE_KEYS.courses, CACHE_TTL.courses, async () => {
      const courses = await prisma.course.findMany({ orderBy: { order: 'asc' } })
      return courses as unknown as Course[]
    })
  }

  async findById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({ where: { id } }) as unknown as Promise<Course | null>
  }

  async findBySlug(slug: string): Promise<Course | null> {
    return cacheService.getOrSet(CACHE_KEYS.course(slug), CACHE_TTL.courses, async () => {
      const course = await prisma.course.findUnique({ where: { slug } })
      return course as unknown as Course | null
    })
  }

  async findWithChapters(slug: string): Promise<(Course & { chapters: Chapter[] }) | null> {
    return prisma.course.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { number: 'asc' } } },
    }) as unknown as Promise<(Course & { chapters: Chapter[] }) | null>
  }

  async updateCoverImage(id: string, coverImage: string): Promise<Course> {
    const course = await prisma.course.update({ where: { id }, data: { coverImage } })
    await cacheService.del(CACHE_KEYS.courses, CACHE_KEYS.course(course.slug))
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
    await cacheService.del(
      CACHE_KEYS.courseProgress(chapter.courseId),
      CACHE_KEYS.globalProgress,
      CACHE_KEYS.resumePoint,
      ...STATS_CACHE_KEYS
    )
    return chapter as unknown as Chapter
  }

  async markStarted(id: string): Promise<boolean> {
    const { count } = await prisma.chapter.updateMany({
      where: { id, status: 'not_started' },
      data: { status: 'in_progress' },
    })
    if (count > 0) await cacheService.del(CACHE_KEYS.resumePoint)
    return count > 0
  }

  async updateNotes(id: string, notes: string): Promise<Chapter> {
    return prisma.chapter.update({ where: { id }, data: { notes } }) as unknown as Promise<Chapter>
  }

  async markReviewed(id: string): Promise<Chapter> {
    return prisma.chapter.update({ where: { id }, data: { lastReviewedAt: new Date() } }) as unknown as Promise<Chapter>
  }

  async getGlobalProgress(): Promise<GlobalProgress> {
    return cacheService.getOrSet(CACHE_KEYS.globalProgress, CACHE_TTL.progress, async () => {
      const [total, completed] = await Promise.all([
        prisma.chapter.count(),
        prisma.chapter.count({ where: { status: 'completed' } }),
      ])
      return { total, completed, percentage: toPercentage(completed, total) }
    })
  }

  async getProgressByCourse(courseId: string): Promise<CourseProgress> {
    return cacheService.getOrSet(CACHE_KEYS.courseProgress(courseId), CACHE_TTL.progress, async () => {
      const [course, total, completed, exam] = await Promise.all([
        prisma.course.findUniqueOrThrow({ where: { id: courseId } }),
        prisma.chapter.count({ where: { courseId } }),
        prisma.chapter.count({ where: { courseId, status: 'completed' } }),
        prisma.courseExam.findUnique({
          where: { courseId },
          include: { attempts: { where: { passed: true }, take: 1 } },
        }),
      ])

      const percentage = toPercentage(completed, total)
      const hasExam = exam !== null
      const examPassed = (exam?.attempts.length ?? 0) > 0

      return {
        courseId,
        slug: course.slug,
        title: course.title,
        color: course.color,
        total,
        completed,
        percentage,
        hasExam,
        examPassed,
        courseCompleted: percentage === 100 && (!hasExam || examPassed),
      }
    })
  }

  // Reuses the per-course cache entries (and their existing invalidation) rather than caching the
  // aggregate under its own key, which every chapter/exam mutation would then also have to clear.
  async getAllCourseProgress(): Promise<CourseProgress[]> {
    const courses = await prisma.course.findMany({ select: { id: true }, orderBy: { order: 'asc' } })
    return Promise.all(courses.map((c) => this.getProgressByCourse(c.id)))
  }

  // Most recently touched in-progress chapter; otherwise the first unfinished chapter after the most
  // recently completed one (same course). Wrapped in an object so a "nothing to resume" answer is cached too.
  async findResumePoint(): Promise<ResumePoint | null> {
    const { point } = await cacheService.getOrSet(CACHE_KEYS.resumePoint, CACHE_TTL.progress, async () => {
      const inProgress = await prisma.chapter.findFirst({
        where: { status: 'in_progress' },
        orderBy: { updatedAt: 'desc' },
        select: RESUME_SELECT,
      })
      if (inProgress) return { point: await toResumePoint(inProgress, 'in_progress') }

      const lastCompleted = await prisma.chapter.findFirst({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
        select: { courseId: true, number: true },
      })
      if (!lastCompleted) return { point: null }

      const next =
        (await prisma.chapter.findFirst({
          where: { courseId: lastCompleted.courseId, status: { not: 'completed' }, number: { gt: lastCompleted.number } },
          orderBy: { number: 'asc' },
          select: RESUME_SELECT,
        })) ??
        (await prisma.chapter.findFirst({
          where: { courseId: lastCompleted.courseId, status: { not: 'completed' } },
          orderBy: { number: 'asc' },
          select: RESUME_SELECT,
        }))
      return { point: next ? await toResumePoint(next, 'next') : null }
    })
    return point
  }
}

const RESUME_SELECT = {
  id: true,
  number: true,
  title: true,
  courseId: true,
  course: { select: { slug: true, title: true, color: true, icon: true } },
} as const

async function toResumePoint(
  chapter: {
    id: string
    number: number
    title: string
    courseId: string
    course: { slug: string; title: string; color: string; icon: string }
  },
  kind: ResumePoint['kind']
): Promise<ResumePoint> {
  const [courseTotal, courseCompleted] = await Promise.all([
    prisma.chapter.count({ where: { courseId: chapter.courseId } }),
    prisma.chapter.count({ where: { courseId: chapter.courseId, status: 'completed' } }),
  ])
  return {
    kind,
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    courseSlug: chapter.course.slug,
    courseTitle: chapter.course.title,
    courseColor: chapter.course.color,
    courseIcon: chapter.course.icon,
    courseCompleted,
    courseTotal,
  }
}
