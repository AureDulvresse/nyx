import { CourseProgress } from '@/domain'

export const ProgressService = {
  percentage(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0
  },

  overallPercentage(courseProgresses: CourseProgress[]): number {
    const total = courseProgresses.reduce((sum, c) => sum + c.total, 0)
    const completed = courseProgresses.reduce((sum, c) => sum + c.completed, 0)
    return this.percentage(completed, total)
  },
}
