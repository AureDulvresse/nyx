import type { Flashcard, SM2Result } from '@/domain'

export interface IFlashcardRepository {
  findDueByDeck(deck: string): Promise<Flashcard[]>
  findAllDecks(): Promise<string[]>
  countDueToday(): Promise<number>
  countByDeck(deck: string): Promise<number>
  findById(id: string): Promise<Flashcard | null>
  applyReview(id: string, result: SM2Result): Promise<Flashcard>
  create(input: Pick<Flashcard, 'deck' | 'front' | 'back'> & { chapterId?: string }): Promise<Flashcard>
}
