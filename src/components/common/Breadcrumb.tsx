import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowRight01Icon } from 'hugeicons-react'

export interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }): React.JSX.Element {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-text-secondary">
      {items.map((item, i) => (
        <Fragment key={item.href}>
          {i > 0 && <ArrowRight01Icon size={12} className="shrink-0" />}
          <Link href={item.href} className="hover:text-text-primary">
            {item.label}
          </Link>
        </Fragment>
      ))}
    </nav>
  )
}
