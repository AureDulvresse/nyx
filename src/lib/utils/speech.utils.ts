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
