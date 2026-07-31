import { prisma } from '@/lib/prisma'
import type { ICertificationRepository } from '../interfaces'
import type { Certification } from '@/domain'

export class PrismaCertificationRepository implements ICertificationRepository {
  async findAll(): Promise<Certification[]> {
    const certs = await prisma.certification.findMany({ orderBy: { priority: 'asc' } })
    return certs as unknown as Certification[]
  }

  async findBySlug(slug: string): Promise<Certification | null> {
    return prisma.certification.findUnique({ where: { slug } }) as unknown as Promise<Certification | null>
  }
}
