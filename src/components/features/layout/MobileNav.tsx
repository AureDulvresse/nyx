'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu01Icon, Cancel01Icon, ShieldKeyIcon } from 'hugeicons-react'
import { NAV_SECTIONS } from '@/lib/constants'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Menu" className="text-text-primary">
        <Menu01Icon size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 flex-col bg-surface p-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldKeyIcon size={22} className="text-violet-nyx" />
                <span className="font-bold text-text-primary">Nyx</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer">
                <Cancel01Icon size={22} className="text-text-secondary" />
              </button>
            </div>
            <nav className="space-y-6">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {section.title}
                  </p>
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
