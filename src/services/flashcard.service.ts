import { Flashcard, SM2Quality, SM2Result } from '@/domain'
import { addDays } from 'date-fns'

export function calculateSM2(
  card: Pick<Flashcard, 'interval' | 'easeFactor' | 'reviewCount'>,
  quality: SM2Quality
): SM2Result {
  let { interval, easeFactor, reviewCount } = card

  if (quality < 3) {
    interval = 1
    reviewCount = 0
  } else {
    interval = reviewCount === 0 ? 1 : reviewCount === 1 ? 6 : Math.round(interval * easeFactor)
    reviewCount++
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  return { interval, easeFactor, nextReview: addDays(new Date(), interval), reviewCount }
}

export const FlashcardService = {
  calculateSM2,
  isDue: (card: Flashcard): boolean => new Date(card.nextReview) <= new Date(),
}
