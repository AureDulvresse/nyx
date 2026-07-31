import { Coins01Icon } from 'hugeicons-react'

export function CreditsBadge({ earned, total }: { earned: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1.5 text-sm font-medium text-teal">
      <Coins01Icon size={16} />
      <span>{earned}/{total} crédits</span>
    </div>
  )
}
