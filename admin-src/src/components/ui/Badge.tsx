import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'green'
  | 'amber'
  | 'red'
  | 'purple'
  | 'slate'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-ink-soft ring-line-strong',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
