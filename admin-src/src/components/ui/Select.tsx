import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type OptionHTMLAttributes,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFloatingPanel } from './useFloatingPanel'

/**
 * A fully custom listbox that replaces the native <select> -- the native
 * element's open dropdown is rendered by the OS and can't be styled to
 * match the rest of the app. Accepts the same <option value="..."> children
 * and fires onChange with a { target: { value } } shape, so existing call
 * sites (`onChange={(e) => setX(e.target.value)}`) work completely
 * unchanged; only this file needed to be rewritten.
 *
 * The options panel is portaled to document.body (rather than absolutely
 * positioned in place) so it isn't clipped when this Select sits inside a
 * Modal's scrollable body.
 */

type FakeChangeEvent = { target: { value: string } }

export interface SelectProps {
  value?: string
  onChange?: (e: FakeChangeEvent) => void
  children?: ReactNode
  className?: string
  disabled?: boolean
  placeholder?: string
  id?: string
}

interface OptionEntry {
  value: string
  label: ReactNode
}

function optionsFromChildren(children: ReactNode): OptionEntry[] {
  const out: OptionEntry[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child)) return
    const value = child.props.value ?? (typeof child.props.children === 'string' ? child.props.children : '')
    out.push({ value: String(value), label: child.props.children })
  })
  return out
}

export function Select({ value, onChange, children, className, disabled, placeholder, id }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)
  const rect = useFloatingPanel(open, triggerRef)

  const options = useMemo(() => optionsFromChildren(children), [children])
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value)
      setHighlighted(idx >= 0 ? idx : 0)
    }
  }, [open, options, value])

  useEffect(() => {
    if (!open) return
    panelRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' })
  }, [open, highlighted])

  function commit(idx: number) {
    const opt = options[idx]
    if (!opt) return
    onChange?.({ target: { value: opt.value } })
    setOpen(false)
  }

  function onTriggerKeyDown(e: ReactKeyboardEvent) {
    if (disabled) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setHighlighted((h) => Math.min(h + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) setOpen(true)
      else commit(highlighted)
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-line-strong bg-white px-3 text-left text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className={cn('truncate', !selected && 'text-ink-mute')}>
          {selected ? selected.label : (placeholder ?? 'Select…')}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-ink-mute transition-transform', open && 'rotate-180')} />
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={panelRef}
            role="listbox"
            tabIndex={-1}
            style={{ top: rect.top, left: rect.left, minWidth: rect.width }}
            className="fixed z-50 max-h-60 max-w-xs overflow-auto rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-pop)]"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value
              return (
                <li
                  key={opt.value + idx}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(idx)}
                  onClick={() => commit(idx)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-ink',
                    idx === highlighted ? 'bg-muted' : 'hover:bg-muted',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="size-3.5 shrink-0 text-brand-600" />}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
