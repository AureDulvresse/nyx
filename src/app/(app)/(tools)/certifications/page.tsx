import { certificationRepo, chapterRepo, courseRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { CertificationCard } from '@/components/features/certifications/CertificationCard'
import { CertificationService } from '@/services'

export default async function Page() {
  const [certs, courses] = await Promise.all([certificationRepo.findAll(), courseRepo.findAll()])
  const progresses = await Promise.all(courses.map((c) => chapterRepo.getProgressByCourse(c.id)))

  const certsWithReadiness = certs.map((cert) => ({
    ...cert,
    readiness: CertificationService.computeReadiness(cert, progresses),
  }))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Certifications"
        description={`${certs.length} certifications visées, classées par priorité de parcours.`}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certsWithReadiness.map((cert) => (
          <CertificationCard key={cert.id} cert={cert} />
        ))}
      </div>
    </div>
  )
}
