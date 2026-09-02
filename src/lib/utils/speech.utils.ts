// Turns a chapter/lab's raw MDX source into something Piper can read naturally: code blocks and
// data-heavy self-closing components (Steps, CompareTable...) are dropped since reading their raw
// syntax aloud is unintelligible, while prose callouts (WarningCallout, TipCallout...) keep their
// inner text since it's often the most important safety/context note in the chapter.
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
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{2,}/g, '\n\n')
    .trim()
}

// Piper synthesizes one WAV per request, buffered fully server-side before any bytes reach the
// browser (see infra/piper/server.py) — sending a whole chapter as a single request means a single
// long-running synthesis with no way to tell "finished early" from "cut short", and no visible error
// either way. Splitting into chunks bounds each request and lets useTextToSpeech chain playback via
// audio.onended, so a full chapter is actually read start to finish instead of stopping partway.
const MAX_SPEECH_CHUNK_LENGTH = 1500

export function splitTextForSpeech(text: string, maxLength = MAX_SPEECH_CHUNK_LENGTH): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''

  const flush = () => {
    if (current) chunks.push(current.trim())
    current = ''
  }

  const addPiece = (piece: string) => {
    if (!piece) return
    if (piece.length > maxLength) {
      // A single sentence is still too long on its own — hard-split as a last resort.
      flush()
      for (let i = 0; i < piece.length; i += maxLength) {
        chunks.push(piece.slice(i, i + maxLength).trim())
      }
      return
    }
    const candidate = current ? `${current} ${piece}` : piece
    if (candidate.length > maxLength) {
      flush()
      current = piece
    } else {
      current = candidate
    }
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLength) {
      addPiece(paragraph)
      continue
    }
    // Paragraph alone exceeds the limit — fall back to sentence boundaries.
    const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) ?? [paragraph]
    for (const sentence of sentences) addPiece(sentence.trim())
  }
  flush()

  return chunks.length > 0 ? chunks : [text.trim()].filter(Boolean)
}
