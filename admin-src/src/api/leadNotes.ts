import { supabase } from '@/lib/supabase'
import type { LeadNote, Tables } from '@/types/database'

export type LeadNoteInsert = Tables['lead_notes']['Insert']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listLeadNotes(leadId: string): Promise<LeadNote[]> {
  const { data, error } = await db()
    .from('lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createLeadNote(input: LeadNoteInsert): Promise<LeadNote> {
  const { data, error } = await db().from('lead_notes').insert(input).select().single()
  if (error) throw error
  return data
}
