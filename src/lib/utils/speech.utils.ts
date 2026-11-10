// Turns a chapter/lab's raw MDX source into something the speech engine can read naturally: code blocks and
// data-heavy self-closing components (Steps, CompareTable...) are dropped since reading their raw
// syntax aloud is unintelligible, while prose callouts (WarningCallout, TipCallout...) keep their
// inner text since it's often the most important safety/context note in the chapter.
function withFinalPunctuation(text: string): string {
  const trimmed = text.trim()
  return /[.!?:;,…]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

export function stripMarkdownForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    // [^<]* (not [\s\S]*?) matters: a lazy any-char match here would happily cross right over a
    // non-self-closing tag (TipCallout, CehCallout...) that has no "/>" of its own, and keep
    // searching until it hit some LATER unrelated self-closing tag's "/>" — silently deleting
    // every heading and callout in between as if it were one giant self-closing component.
    .replace(/<[A-Z]\w*[^<]*\/>/g, '')
    .replace(/<([A-Z]\w*)[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Headings and list items rarely end with punctuation: without one, the voice runs them into
    // the next sentence with no pause.
    .replace(/^#{1,6}\s+(.+)$/gm, (_m, title: string) => `\n${withFinalPunctuation(title)}\n`)
    .replace(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/gm, (_m, item: string) => withFinalPunctuation(item))
    .replace(/\s*(?:->|=>|→)\s*/g, ', ')
    .replace(/\|/g, ', ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{2,}/g, '\n\n')
    .trim()
}

// Chunks are synthesized one by one by Piper while the previous one plays: a short first chunk
// makes playback start almost immediately, later chunks stay bounded so each request is fast.
const FIRST_SPEECH_CHUNK_LENGTH = 200
const MAX_SPEECH_CHUNK_LENGTH = 700

export function splitTextForSpeech(
  text: string,
  maxLength = MAX_SPEECH_CHUNK_LENGTH,
  firstMaxLength = FIRST_SPEECH_CHUNK_LENGTH
): string[] {
  const sentences = text
    .split(/\n{2,}/)
    .flatMap((paragraph) => paragraph.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+["»)]*\s*|[^.!?…]+$/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''
  const limit = (): number => (chunks.length === 0 ? firstMaxLength : maxLength)

  for (const sentence of sentences) {
    for (const piece of splitLongSentence(sentence, maxLength)) {
      const candidate = current ? `${current} ${piece}` : piece
      if (current && candidate.length > limit()) {
        chunks.push(current)
        current = piece
      } else {
        current = candidate
      }
    }
  }
  if (current) chunks.push(current)
  return chunks
}

// Last resort for a single sentence longer than a chunk: cut on commas, then on spaces — never
// mid-word, which would make the voice stumble.
function splitLongSentence(sentence: string, maxLength: number): string[] {
  if (sentence.length <= maxLength) return [sentence]
  const parts: string[] = []
  let current = ''
  for (const word of sentence.split(/(?<=,)\s+|\s+/)) {
    const candidate = current ? `${current} ${word}` : word
    if (current && candidate.length > maxLength) {
      parts.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) parts.push(current)
  return parts
}
