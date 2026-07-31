export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export const ok = <T>(data: T): ActionResult<T> => ({ success: true, data })
export const err = (error: string, code?: string): ActionResult<never> => ({ success: false, error, code })
