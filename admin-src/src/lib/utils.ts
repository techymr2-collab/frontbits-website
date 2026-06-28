/**
 * Tiny class name joiner. Keeps falsey values out so we can write
 * conditional classes inline without pulling in extra dependencies.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Build initials from a name, e.g. "Saud Ali" -> "SA". */
export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'
}

/** Turn blank optional form fields into null before sending to Supabase. */
export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const key in out) {
    if (out[key] === '') out[key] = null as T[typeof key]
  }
  return out
}
