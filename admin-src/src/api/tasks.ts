import { supabase } from '@/lib/supabase'
import type { Task, Tables } from '@/types/database'

export type TaskInsert = Tables['tasks']['Insert']
export type TaskUpdate = Tables['tasks']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await db()
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createTask(input: TaskInsert): Promise<Task> {
  const { data, error } = await db().from('tasks').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateTask(id: string, input: TaskUpdate): Promise<Task> {
  const { data, error } = await db().from('tasks').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await db().from('tasks').delete().eq('id', id)
  if (error) throw error
}
