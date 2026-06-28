import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-muted/90 text-xs uppercase tracking-wide text-ink-mute backdrop-blur">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-line last:border-0',
        onClick && 'cursor-pointer hover:bg-muted/60',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function Th({
  children,
  sortable,
  active,
  dir,
  onClick,
  className,
}: {
  children: ReactNode
  sortable?: boolean
  active?: boolean
  dir?: 'asc' | 'desc'
  onClick?: () => void
  className?: string
}) {
  if (!sortable) {
    return <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
  }
  return (
    <th className={cn('px-4 py-3 font-medium', className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn('inline-flex items-center gap-1 hover:text-ink', active && 'text-ink')}
      >
        {children}
        {active && (dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
      </button>
    </th>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-ink', className)}>{children}</td>
}
