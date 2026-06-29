import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFloatingPanel } from './useFloatingPanel'

/**
 * Replaces the native <input type="date">, whose calendar popup is
 * rendered by the OS and can't be styled. Value/onChange use the same
 * yyyy-MM-dd string and { target: { value } } shape as the native input,
 * so call sites that previously did
 *   <Input type="date" value={v} onChange={(e) => set(e.target.value)} />
 * only need the tag swapped to <DatePicker ... />, nothing else.
 *
 * The calendar panel is portaled to document.body (rather than absolutely
 * positioned in place) so it isn't clipped when this sits inside a Modal's
 * scrollable body.
 */

type FakeChangeEvent = { target: { value: string } }

export interface DatePickerProps {
  value?: string
  onChange?: (e: FakeChangeEvent) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function parseValue(value: string | undefined): Date | null {
  if (!value) return null
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : null
}

export function DatePicker({ value, onChange, placeholder, className, disabled, id }: DatePickerProps) {
  const selectedDate = parseValue(value)
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => selectedDate ?? new Date())
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const rect = useFloatingPanel(open, triggerRef)

  useEffect(() => {
    if (open) setViewMonth(selectedDate ?? new Date())
  }, [open, selectedDate])

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

  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function commit(day: Date) {
    onChange?.({ target: { value: format(day, 'yyyy-MM-dd') } })
    setOpen(false)
  }

  function clear() {
    onChange?.({ target: { value: '' } })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-line-strong bg-white px-3 text-left text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className={cn('truncate', !selectedDate && 'text-ink-mute')}>
          {selectedDate ? format(selectedDate, 'd MMM yyyy') : (placeholder ?? 'Select date')}
        </span>
        <Calendar className="size-4 shrink-0 text-ink-mute" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: rect.top, left: rect.left }}
            className="fixed z-50 w-72 rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow-pop)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-muted"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold text-ink">{format(viewMonth, 'MMMM yyyy')}</span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-muted"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {WEEKDAY_LABELS.map((d) => (
                <span key={d} className="py-1 text-[11px] font-medium text-ink-mute">
                  {d}
                </span>
              ))}
              {days.map((day) => {
                const inMonth = isSameMonth(day, viewMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                return (
                  <button
                    type="button"
                    key={day.toISOString()}
                    onClick={() => commit(day)}
                    className={cn(
                      'mx-auto flex size-8 items-center justify-center rounded-full text-sm transition-colors',
                      !inMonth && 'text-ink-mute/50',
                      inMonth && !isSelected && 'text-ink hover:bg-muted',
                      isSelected && 'bg-brand-500 font-semibold text-white hover:bg-brand-600',
                      !isSelected && isToday(day) && 'ring-1 ring-inset ring-brand-300',
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
              <button
                type="button"
                onClick={() => commit(new Date())}
                className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-muted"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-ink-mute hover:bg-muted"
                >
                  Clear
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
