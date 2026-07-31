export interface ChapterFrontmatter {
  title: string
  chapter: number
  course: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  tags: string[]
  ceh_modules?: string[]
  objectives: string[]
}

export interface ChapterContent {
  frontmatter: ChapterFrontmatter
  source: string
}

export interface LabFrontmatter {
  title: string
  slug: string
  category: string
  difficulty: string
}

export interface LabContent {
  frontmatter: LabFrontmatter
  source: string
}
