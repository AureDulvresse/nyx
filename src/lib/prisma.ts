import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

export const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
