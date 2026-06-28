import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(
              'h-10 w-full rounded-lg border border-line-strong bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-mute focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              className,
            )}
            {...props}
          />
        </div>
      )
    }
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border border-line-strong bg-white px-3 text-sm text-ink placeholder:text-ink-mute focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-mute">{hint}</p>
      ) : null}
    </div>
  )
}
