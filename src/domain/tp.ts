import type { DockerTarget } from './lab'

export interface TPStep {
  title: string
  description: string
  code?: string
  completed?: boolean
}

export interface TP {
  id: string
  chapterId: string
  title: string
  environment: string
  objectives: string[]
  steps: TPStep[]
  // Network machine(s) to boot alongside the attacker Kali box, same shape as a Lab's targets —
  // empty for TPs that are local-only (no network target, e.g. openssl, pandas, systemd).
  targets: DockerTarget[]
  notes?: string | null
  completedAt?: Date | null
}
