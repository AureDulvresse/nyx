'use client'

import { Download04Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Download04Icon size={16} />
      Exporter en PDF
    </Button>
  )
}
