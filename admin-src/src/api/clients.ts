import { supabase } from '@/lib/supabase'
import type { Client, Tables } from '@/types/database'

export type ClientInsert = Tables['clients']['Insert']
export type ClientUpdate = Tables['clients']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listClients(): Promise<Client[]> {
  const { data, error } = await db()
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('company_name', { ascending: true })
  if (error) throw error
  return data
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await db()
    .from('clients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createClient(input: ClientInsert): Promise<Client> {
  const { data, error } = await db().from('clients').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateClient(id: string, input: ClientUpdate): Promise<Client> {
  const { data, error } = await db().from('clients').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await db().from('clients').delete().eq('id', id)
  if (error) throw error
}
