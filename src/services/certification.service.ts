import type { Certification, CourseProgress } from '@/domain'
import { ProgressService } from './progress.service'

export const CertificationService = {
  computeReadiness(cert: Certification, courseProgresses: CourseProgress[]): number {
    const linked = courseProgresses.filter((c) => cert.linkedCourses.includes(c.slug))
    return ProgressService.overallPercentage(linked)
  },

  withReadiness(certs: Certification[], courseProgresses: CourseProgress[]): Certification[] {
    return certs.map((cert) => ({ ...cert, readiness: CertificationService.computeReadiness(cert, courseProgresses) }))
  },
}
