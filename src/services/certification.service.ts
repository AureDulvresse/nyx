import { Certification, CourseProgress } from '@/domain'

export const CertificationService = {
  computeReadiness(cert: Certification, courseProgresses: CourseProgress[]): number {
    const linked = courseProgresses.filter((c) => cert.linkedCourses.includes(c.slug))
    if (linked.length === 0) return 0

    const total = linked.reduce((sum, c) => sum + c.total, 0)
    const completed = linked.reduce((sum, c) => sum + c.completed, 0)
    return total > 0 ? Math.round((completed / total) * 100) : 0
  },
}
