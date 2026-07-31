import { ServerStack01Icon, IncognitoIcon } from 'hugeicons-react'
import type { DockerTarget } from '@/domain'

export function NetworkMap({ targets }: { targets: DockerTarget[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="rounded-lg bg-red/15 p-3">
          <IncognitoIcon size={22} className="text-red" />
        </div>
        <span className="text-xs text-text-secondary">Kali (toi)</span>
      </div>
      {targets.map((target) => (
        <div key={target.name} className="flex flex-col items-center gap-1 text-center">
          <div className="rounded-lg bg-blue/15 p-3">
            <ServerStack01Icon size={22} className="text-blue" />
          </div>
          <span className="text-xs text-text-secondary">{target.hostname ?? target.name}</span>
          <span className="text-[10px] text-text-secondary">{target.ip}</span>
        </div>
      ))}
    </div>
  )
}
