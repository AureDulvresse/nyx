import type { Chapter, CourseProgress } from '@/domain'
import { toPercentage } from '@/lib/utils/math.utils'

export const ProgressService = {
  percentage: toPercentage,

  overallPercentage(courseProgresses: Pick<CourseProgress, 'total' | 'completed'>[]): number {
    const total = courseProgresses.reduce((sum, c) => sum + c.total, 0)
    const completed = courseProgresses.reduce((sum, c) => sum + c.completed, 0)
    return toPercentage(completed, total)
  },

  // What the course page's main CTA should point to: the exam once every chapter is done and it's
  // still unpassed, otherwise the first unfinished chapter (or chapter 1 to revisit a finished course).
  courseNavigation(
    chapters: Pick<Chapter, 'number' | 'status'>[],
    progress: Pick<CourseProgress, 'percentage' | 'hasExam' | 'examPassed'>
  ): { nextChapter: Pick<Chapter, 'number' | 'status'> | undefined; hasStarted: boolean; examPending: boolean } {
    const sorted = [...chapters].sort((a, b) => a.number - b.number)
    return {
      nextChapter: sorted.find((c) => c.status !== 'completed') ?? sorted[0],
      hasStarted: sorted.some((c) => c.status !== 'not_started'),
      examPending: progress.percentage === 100 && progress.hasExam && !progress.examPassed,
    }
  },
}
