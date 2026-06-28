import { supabase } from '@/lib/supabase'
import type { Booking, Tables } from '@/types/database'

export type BookingUpdate = Tables['bookings']['Update']

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listBookings(): Promise<Booking[]> {
  const { data, error } = await db()
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: false })
  if (error) throw error
  return data
}

export async function getBooking(id: string): Promise<Booking | null> {
  const { data, error } = await db().from('bookings').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

/**
 * Admins can only update internal_notes and lead_id here -- start/end time,
 * attendee info, and status are owned by the Cal.com webhook sync and would
 * just be overwritten on the next delivery if edited locally.
 */
export async function updateBooking(id: string, input: BookingUpdate): Promise<Booking> {
  const { data, error } = await db().from('bookings').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}
