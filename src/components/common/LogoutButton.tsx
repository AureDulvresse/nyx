'use client'

import { Logout01Icon } from 'hugeicons-react'
import { logoutAction } from '@/actions'

export function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-red"
      aria-label="Se déconnecter"
    >
      <Logout01Icon size={16} />
    </button>
  )
}
