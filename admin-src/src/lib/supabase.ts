import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * True when both Supabase env values are present. When false, the app runs
 * in a local preview mode (dev only) so the shell can be viewed without a
 * live project. Real auth and data require these values.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The Supabase client, or null when the project is not yet configured.
 * Callers should guard on `isSupabaseConfigured` before using it.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
