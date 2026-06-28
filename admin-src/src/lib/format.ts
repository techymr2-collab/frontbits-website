import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import type { Currency } from '@/types/database'

export type CurrencyCode = Currency

export const DEFAULT_CURRENCY: CurrencyCode = 'AED'
export const DEFAULT_VAT_RATE = 5 // percent

/**
 * Format a money amount with its currency code. We work in AED by default
 * but bill some clients in USD, so the code is always explicit.
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Compact money for cards and tight spaces, e.g. AED 12.4K. */
export function formatMoneyCompact(
  amount: number | null | undefined,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = typeof value === 'string' ? parseISO(value) : value
  return isValid(date) ? date : null
}

/** Friendly date, e.g. 25 Jun 2026. */
export function formatDate(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'd MMM yyyy') : 'No date'
}

/** Date with time, e.g. 25 Jun 2026, 14:30. */
export function formatDateTime(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'd MMM yyyy, HH:mm') : 'No date'
}

/** Relative time, e.g. about 3 hours ago. */
export function formatRelative(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : 'No date'
}

/** Value for a native date input, e.g. 2026-06-25. */
export function toDateInputValue(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'yyyy-MM-dd') : ''
}
