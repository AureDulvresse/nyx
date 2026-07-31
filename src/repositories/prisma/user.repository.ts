import { prisma } from '@/lib/prisma'
import type { IUserRepository, AppUser } from '../interfaces'

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<AppUser | null> {
    return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  }
}
