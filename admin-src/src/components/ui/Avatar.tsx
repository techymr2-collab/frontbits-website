import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Avatar({
  name,
  className,
}: {
  name: string | null | undefined
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
