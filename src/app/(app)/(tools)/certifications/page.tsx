import { certificationRepo, chapterRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { CertificationCard } from '@/components/features/certifications/CertificationCard'
import { CertificationService } from '@/services'

export default async function Page(): Promise<React.JSX.Element> {
  const [certs, progresses] = await Promise.all([certificationRepo.findAll(), chapterRepo.getAllCourseProgress()])
  const certsWithReadiness = CertificationService.withReadiness(certs, progresses)

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
