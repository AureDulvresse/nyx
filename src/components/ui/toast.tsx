'use client'

import { useEffect } from 'react'
import { CheckmarkCircle02Icon, AlertCircleIcon, InformationCircleIcon, Cancel01Icon } from 'hugeicons-react'
import { useToastStore, type Toast, type ToastVariant } from '@/lib/store/toast.store'
import { cn } from '@/lib/utils/cn'

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-green/40 bg-green/10 text-green',
  error: 'border-red/40 bg-red/10 text-red',
  info: 'border-blue/40 bg-blue/10 text-blue',
}

const VARIANT_ICON: Record<ToastVariant, typeof CheckmarkCircle02Icon> = {
  success: CheckmarkCircle02Icon,
  error: AlertCircleIcon,
  info: InformationCircleIcon,
}

const AUTO_DISMISS_MS = 5000

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const Icon = VARIANT_ICON[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast.id, dismiss])

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm',
        VARIANT_STYLES[toast.variant]
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-text-primary">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Fermer la notification"
        className="shrink-0 text-text-secondary hover:text-text-primary"
      >
        <Cancel01Icon size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
