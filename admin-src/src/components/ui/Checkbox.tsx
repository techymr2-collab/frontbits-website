import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => (
    <label htmlFor={id} className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink-soft">
      <input ref={ref} id={id} type="checkbox" className="peer sr-only" {...props} />
      <span
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded border border-line-strong bg-white peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30',
          className,
        )}
      >
        <Check className="size-3 text-white" strokeWidth={3} />
      </span>
      {label}
    </label>
  ),
)
Checkbox.displayName = 'Checkbox'
