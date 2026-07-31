import type { TP, TPStep } from '@/domain'

export interface ITPRepository {
  findById(id: string): Promise<TP | null>
  findByChapter(chapterId: string): Promise<TP | null>
  findAll(): Promise<TP[]>
  updateNotes(id: string, notes: string): Promise<TP>
  updateSteps(id: string, steps: TPStep[]): Promise<TP>
  complete(id: string): Promise<TP>
}
