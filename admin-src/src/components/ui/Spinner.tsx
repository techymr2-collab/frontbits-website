import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand-500', className)} />
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-canvas">
      <Spinner className="size-6" />
      {label && <p className="text-sm text-ink-mute">{label}</p>}
    </div>
  )
}
