import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-mute focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
