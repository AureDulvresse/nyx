'use client'

import { useState } from 'react'
import { SparklesIcon, Cancel01Icon } from 'hugeicons-react'
import { ChatPanel } from './ChatPanel'

export function AskNyxWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && <ChatPanel />}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-nyx text-white shadow-lg transition-transform hover:scale-105"
        aria-label={open ? 'Fermer Ask Nyx' : 'Ouvrir Ask Nyx'}
      >
        {open ? <Cancel01Icon size={22} /> : <SparklesIcon size={22} />}
      </button>
    </div>
  )
}
