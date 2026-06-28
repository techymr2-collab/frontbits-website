import { supabase } from '@/lib/supabase'
import type { Contact, Tables } from '@/types/database'

export type ContactInsert = Tables['contacts']['Insert']
export type ContactUpdate = Tables['contacts']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listContacts(clientId: string): Promise<Contact[]> {
  const { data, error } = await db()
    .from('contacts')
    .select('*')
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false })
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createContact(input: ContactInsert): Promise<Contact> {
  if (input.is_primary) {
    await db().from('contacts').update({ is_primary: false }).eq('client_id', input.client_id)
  }
  const { data, error } = await db().from('contacts').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateContact(
  id: string,
  clientId: string,
  input: ContactUpdate,
): Promise<Contact> {
  if (input.is_primary) {
    await db().from('contacts').update({ is_primary: false }).eq('client_id', clientId)
  }
  const { data, error } = await db().from('contacts').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await db().from('contacts').delete().eq('id', id)
  if (error) throw error
}
