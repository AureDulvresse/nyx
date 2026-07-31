import { flashcardRepo } from '@/repositories'
import { PageHeader } from '@/components/common/PageHeader'
import { DeckCard } from '@/components/features/flashcards/DeckCard'

export default async function Page() {
  const decks = await flashcardRepo.findAllDecks()
  const [dueByDeck, totalByDeck] = await Promise.all([
    Promise.all(decks.map((d) => flashcardRepo.findDueByDeck(d))),
    Promise.all(decks.map((d) => flashcardRepo.countByDeck(d))),
  ])

  return (
    <div className="space-y-8">
      <PageHeader title="Flashcards" description="Révision espacée (SM-2) pour ancrer les connaissances long terme." />
      {decks.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck, i) => (
            <DeckCard key={deck} deck={deck} dueCount={dueByDeck[i].length} totalCount={totalByDeck[i]} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-text-secondary">Aucune flashcard disponible pour le moment.</p>
      )}
    </div>
  )
}
