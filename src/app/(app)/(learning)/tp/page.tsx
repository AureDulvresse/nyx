import { tpRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { TPExplorer } from '@/components/features/tp/TPExplorer'

export default async function Page() {
  const tps = await tpRepo.findAll()

  return (
    <div className="space-y-8">
      <PageHeader title="Travaux Pratiques" description="Mets en pratique tes connaissances, étape par étape." />
      {tps.length > 0 ? (
        <TPExplorer tps={tps} />
      ) : (
        <p className="py-10 text-center text-text-secondary">Aucun TP disponible pour le moment.</p>
      )}
    </div>
  )
}
