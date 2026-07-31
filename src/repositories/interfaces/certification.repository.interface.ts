import type { Certification } from '@/domain'

export interface ICertificationRepository {
  findAll(): Promise<Certification[]>
  findBySlug(slug: string): Promise<Certification | null>
}
