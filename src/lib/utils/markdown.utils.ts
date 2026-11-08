// Pure helpers over raw chapter markdown — no framework deps, safe on server and client.

export interface MarkdownHeading {
  id: string
  text: string
  level: 2 | 3
}

const FENCE = /^\s*(```|~~~)/
const HEADING = /^(#{2,3})\s+(.+?)\s*#*\s*$/

// Inline markdown → visible text (what rehype-slug sees as the heading's text content).
function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/~~(.+?)~~/g, '$1')
    .trim()
}

// Mirrors github-slugger (used by rehype-slug): lowercase, drop everything that isn't a letter,
// mark, number, connector punctuation, space or hyphen, then spaces → hyphens.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-')
}

/** h2/h3 headings of a markdown document, with the same ids rehype-slug will generate. */
export function extractHeadings(source: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = []
  const seen = new Map<string, number>()
  let inFence = false

  for (const line of source.split('\n')) {
    if (FENCE.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = HEADING.exec(line)
    if (!match) continue

    const text = toPlainText(match[2])
    if (!text) continue

    // Duplicate handling matches github-slugger: "x", "x-1", "x-2"…
    const base = slugify(text)
    let id = base
    while (seen.has(id)) {
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      id = `${base}-${n}`
    }
    seen.set(id, 0)

    headings.push({ id, text, level: match[1].length as 2 | 3 })
  }

  return headings
}

const WORDS_PER_MINUTE = 200

/** Reading time in minutes (≥ 1), ignoring fenced code blocks and markup. */
export function estimateReadingMinutes(source: string): number {
  const prose = source
    .replace(/^---[\s\S]*?---/, '')
    .replace(/(```|~~~)[\s\S]*?\1/g, '')
    .replace(/<[^>]+>/g, ' ')
  const words = prose.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
