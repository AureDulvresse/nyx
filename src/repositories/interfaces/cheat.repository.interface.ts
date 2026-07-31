import type { CheatEntry } from '@/domain'

export interface ICheatRepository {
  search(query?: string, category?: string): Promise<CheatEntry[]>
  findByCategory(category: string): Promise<CheatEntry[]>
  listCategories(): Promise<string[]>
  toggleFavorite(id: string): Promise<CheatEntry>
}
