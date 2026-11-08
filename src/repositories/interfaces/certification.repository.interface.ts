import type { Certification } from '@/domain'

export interface ICertificationRepository {
  findAll(): Promise<Certification[]>
}
