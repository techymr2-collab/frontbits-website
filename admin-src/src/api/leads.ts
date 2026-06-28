import { supabase } from '@/lib/supabase'
import type { Client, Lead, Tables } from '@/types/database'

export type LeadInsert = Tables['leads']['Insert']
export type LeadUpdate = Tables['leads']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await db()
    .from('leads')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await db()
    .from('leads')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createLead(input: LeadInsert): Promise<Lead> {
  const { data, error } = await db().from('leads').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateLead(id: string, input: LeadUpdate): Promise<Lead> {
  const { data, error } = await db().from('leads').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await db().from('leads').delete().eq('id', id)
  if (error) throw error
}

export async function convertLeadToClient(lead: Lead): Promise<Client> {
  const { data: client, error: clientError } = await db()
    .from('clients')
    .insert({
      company_name: lead.company || lead.name,
      primary_contact_name: lead.name,
      email: lead.email,
      phone: lead.phone,
      billing_currency: lead.currency,
      status: 'Active',
    })
    .select()
    .single()
  if (clientError) throw clientError

  const { error: leadError } = await db()
    .from('leads')
    .update({ converted_client_id: client.id, status: 'Won' })
    .eq('id', lead.id)
  if (leadError) throw leadError

  return client
}
