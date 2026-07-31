'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'
import { LoginSchema } from '@/lib/schemas'
import { ok, err, ActionResult } from '@/lib/utils/result'

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  const v = LoginSchema.safeParse(input)
  if (!v.success) return err('Identifiants invalides.', 'VALIDATION')

  try {
    await signIn('credentials', { ...v.data, redirect: false })
    return ok(undefined)
  } catch (error) {
    if (error instanceof AuthError) return err('Email ou mot de passe incorrect.', 'INVALID_CREDENTIALS')
    throw error
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}
