import { supabase } from '@/lib/supabase'
import type { BlogPost, Tables } from '@/types/database'

export type BlogPostInsert = Tables['blog_posts']['Insert']
export type BlogPostUpdate = Tables['blog_posts']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await db()
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await db().from('blog_posts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createBlogPost(input: BlogPostInsert): Promise<BlogPost> {
  const { data, error } = await db().from('blog_posts').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateBlogPost(id: string, input: BlogPostUpdate): Promise<BlogPost> {
  const { data, error } = await db()
    .from('blog_posts')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await db().from('blog_posts').delete().eq('id', id)
  if (error) throw error
}
