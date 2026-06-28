import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await db().from('profiles').select('*').order('full_name', { ascending: true })
  if (error) throw error
  return data
}
