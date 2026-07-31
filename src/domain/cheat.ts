export interface CheatEntry {
  id: string
  category: string
  subcategory?: string | null
  title: string
  command: string
  description: string
  example?: string | null
  tags: string[]
  isFavorite: boolean
  createdAt: Date
}
