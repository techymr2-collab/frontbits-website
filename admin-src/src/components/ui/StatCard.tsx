import type { ReactNode } from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'neutral' | 'green' | 'red'
}) {
  const valueTone = {
    neutral: 'text-ink',
    green: 'text-emerald-700',
    red: 'text-red-700',
  }[tone]

  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium text-ink-mute">{label}</p>
      <p className={cn('mt-1.5 text-2xl font-semibold tracking-tight', valueTone)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
    </Card>
  )
}
