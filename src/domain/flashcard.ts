export interface Flashcard {
  id: string
  deck: string
  chapterId?: string | null
  front: string
  back: string
  interval: number
  easeFactor: number
  nextReview: Date
  reviewCount: number
}

export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2Result {
  interval: number
  easeFactor: number
  nextReview: Date
  reviewCount: number
}
