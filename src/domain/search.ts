export type SearchResultType = 'course' | 'chapter' | 'cheat' | 'lab'

export interface SearchResultItem {
  type: SearchResultType
  title: string
  subtitle?: string
  href: string
}
