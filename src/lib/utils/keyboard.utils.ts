/** True when a key event comes from a text field, so global shortcuts must stay out of the way. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/** True when a modifier is held — shortcuts never hijack browser/OS combos. */
export function hasModifier(e: KeyboardEvent): boolean {
  return e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
}
