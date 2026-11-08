import { err, type ActionResult } from './result'

interface ActionErrorOptions {
  /** Message returned when the handler throws (or when the thrown value isn't an Error). */
  message: string
  code?: string
  /** Return the thrown Error's own message instead of `message` (for user-facing service errors). */
  exposeError?: boolean
}

// Shared try/catch for server actions: any exception thrown by `handler` becomes an err() result
// instead of propagating to the client as an opaque server error.
export async function runAction<T>(
  handler: () => Promise<ActionResult<T>>,
  { message, code, exposeError = false }: ActionErrorOptions
): Promise<ActionResult<T>> {
  try {
    return await handler()
  } catch (e) {
    return err(exposeError && e instanceof Error ? e.message : message, code)
  }
}
