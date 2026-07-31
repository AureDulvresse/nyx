import { flashcardRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { ReviewSession } from '@/components/features/flashcards/ReviewSession'

export default async function Page({ searchParams }: { searchParams: Promise<{ deck?: string }> }) {
  const { deck } = await searchParams
  const cards = deck ? await flashcardRepo.findDueByDeck(deck) : []

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title={`Révision — ${deck ?? 'Deck inconnu'}`} />
      <ReviewSession cards={cards} />
    </div>
  )
}
