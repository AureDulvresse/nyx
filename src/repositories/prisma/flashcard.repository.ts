import { prisma } from '@/lib/prisma'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'
import type { IFlashcardRepository } from '../interfaces'
import type { Flashcard, SM2Result } from '@/domain'

export class PrismaFlashcardRepository implements IFlashcardRepository {
  async findDueByDeck(deck: string): Promise<Flashcard[]> {
    const cached = await cacheService.get<Flashcard[]>(CACHE_KEYS.flashcardsDue(deck))
    if (cached) return cached

    const cards = await prisma.flashcard.findMany({
      where: { deck, nextReview: { lte: new Date() } },
      orderBy: { nextReview: 'asc' },
    })
    await cacheService.set(CACHE_KEYS.flashcardsDue(deck), cards, CACHE_TTL.flashcards)
    return cards as unknown as Flashcard[]
  }

  async findAllDecks(): Promise<string[]> {
    const decks = await prisma.flashcard.findMany({ distinct: ['deck'], select: { deck: true } })
    return decks.map((d) => d.deck)
  }

  async countDueToday(): Promise<number> {
    return prisma.flashcard.count({ where: { nextReview: { lte: new Date() } } })
  }

  async countByDeck(deck: string): Promise<number> {
    return prisma.flashcard.count({ where: { deck } })
  }

  async findById(id: string): Promise<Flashcard | null> {
    return prisma.flashcard.findUnique({ where: { id } }) as unknown as Promise<Flashcard | null>
  }

  async applyReview(id: string, result: SM2Result): Promise<Flashcard> {
    const card = await prisma.flashcard.update({
      where: { id },
      data: {
        interval: result.interval,
        easeFactor: result.easeFactor,
        nextReview: result.nextReview,
        reviewCount: result.reviewCount,
      },
    })
    await cacheService.del(CACHE_KEYS.flashcardsDue(card.deck))
    return card as unknown as Flashcard
  }

  async create(input: Pick<Flashcard, 'deck' | 'front' | 'back'> & { chapterId?: string }): Promise<Flashcard> {
    const card = await prisma.flashcard.create({ data: input })
    await cacheService.del(CACHE_KEYS.flashcardsDue(card.deck))
    return card as unknown as Flashcard
  }
}
