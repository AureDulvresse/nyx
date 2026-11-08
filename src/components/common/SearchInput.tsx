import { Search01Icon } from 'hugeicons-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

/** Text input with a leading search icon, as used at the top of every explorer page. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Applied to the wrapper (e.g. `max-w-md flex-1`). */
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn('relative', className)}>
      <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-10" />
    </div>
  )
}
