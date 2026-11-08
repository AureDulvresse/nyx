import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { ChapterContent, ChapterFrontmatter, LabContent, LabFrontmatter } from '@/domain'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

async function findChapterFile(slug: string, chapterNumber: number): Promise<string | null> {
  const dir = path.join(CONTENT_ROOT, 'courses', slug)
  const prefix = String(chapterNumber).padStart(2, '0')
  const files = await readdir(dir).catch(() => [] as string[])
  const match = files.find((f) => f.startsWith(`${prefix}-`) && f.endsWith('.md'))
  return match ? path.join(dir, match) : null
}

export const MDXLoader = {
  async getChapter(slug: string, chapterNumber: number): Promise<ChapterContent | null> {
    const filePath = await findChapterFile(slug, chapterNumber)
    if (!filePath) return null

    const raw = await readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { frontmatter: data as ChapterFrontmatter, source: content }
  },

  async getLab(slug: string): Promise<LabContent | null> {
    const filePath = path.join(CONTENT_ROOT, 'labs', `${slug}.md`)
    const raw = await readFile(filePath, 'utf-8').catch(() => null)
    if (!raw) return null

    const { data, content } = matter(raw)
    return { frontmatter: data as LabFrontmatter, source: content }
  },
}
