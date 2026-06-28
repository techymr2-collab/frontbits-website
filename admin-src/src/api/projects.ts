import { supabase } from '@/lib/supabase'
import type { Project, Tables } from '@/types/database'

export type ProjectInsert = Tables['projects']['Insert']
export type ProjectUpdate = Tables['projects']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await db()
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listProjectsByClient(clientId: string): Promise<Project[]> {
  const { data, error } = await db()
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await db()
    .from('projects')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProject(input: ProjectInsert): Promise<Project> {
  const { data, error } = await db().from('projects').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, input: ProjectUpdate): Promise<Project> {
  const { data, error } = await db().from('projects').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await db().from('projects').delete().eq('id', id)
  if (error) throw error
}
