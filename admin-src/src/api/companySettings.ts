import { supabase } from '@/lib/supabase'
import type { CompanySettings, Tables } from '@/types/database'

export type CompanySettingsUpdate = Tables['company_settings']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const { data, error } = await db().from('company_settings').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function updateCompanySettings(
  id: string,
  input: CompanySettingsUpdate,
): Promise<CompanySettings> {
  const { data, error } = await db()
    .from('company_settings')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
