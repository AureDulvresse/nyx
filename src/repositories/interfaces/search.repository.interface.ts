import type { SearchResultItem } from '@/domain'

export interface ISearchRepository {
  search(query: string): Promise<SearchResultItem[]>
}
