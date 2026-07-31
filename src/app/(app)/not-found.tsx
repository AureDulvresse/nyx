import Link from 'next/link'
import { SearchRemoveIcon } from 'hugeicons-react'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface px-6 py-20 text-center">
      <SearchRemoveIcon size={40} className="text-text-secondary" />
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Page introuvable</h2>
        <p className="mt-1 text-sm text-text-secondary">Ce contenu n&apos;existe pas ou a été déplacé.</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: 'default' })}>
        Retour au dashboard
      </Link>
    </div>
  )
}
