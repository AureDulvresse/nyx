import 'server-only'
import bcrypt from 'bcryptjs'
import { userRepo } from '@/repositories'

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const user = await userRepo.findByEmail(email)
  if (!user) return false
  return bcrypt.compare(password, user.passwordHash)
}
