'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export function ConfirmActivationModal({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal onClose={onCancel}>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Non
        </Button>
        <Button size="sm" onClick={onConfirm}>
          Oui, activer
        </Button>
      </div>
    </Modal>
  )
}
