import { cheatRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { CheatsheetExplorer } from '@/components/features/cheatsheet/CheatsheetExplorer'

export default async function Page() {
  const [entries, categories] = await Promise.all([cheatRepo.search(), cheatRepo.listCategories()])

  return (
    <div className="space-y-6">
      <PageHeader title="Cheatsheet" description={`${entries.length} commandes essentielles, organisées par catégorie.`} />
      <CheatsheetExplorer initialEntries={entries} categories={categories} />
    </div>
  )
}
