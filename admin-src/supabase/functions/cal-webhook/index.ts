// Receives Cal.com booking webhooks and upserts them into the `bookings`
// table. Deploy with:
//   supabase functions deploy cal-webhook
// Then set the shared secret (must match what you enter in Cal.com's
// webhook settings) with:
//   supabase secrets set CAL_WEBHOOK_SECRET=<a random string you choose>
//
// In Cal.com: Settings -> Webhooks -> Add webhook
//   URL: https://<project-ref>.functions.supabase.co/cal-webhook
//   Events: BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED
//   Secret: the same value as CAL_WEBHOOK_SECRET above

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CAL_WEBHOOK_SECRET = Deno.env.get('CAL_WEBHOOK_SECRET')!

const STATUS_BY_EVENT: Record<string, 'confirmed' | 'cancelled' | 'rescheduled'> = {
  BOOKING_CREATED: 'confirmed',
  BOOKING_CANCELLED: 'cancelled',
  BOOKING_RESCHEDULED: 'rescheduled',
}

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(CAL_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // Constant-time-ish comparison; payloads are short so this is adequate here.
  return expected === signatureHeader
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('X-Cal-Signature-256')

  if (!(await verifySignature(rawBody, signature))) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const triggerEvent: string = event.triggerEvent
  const booking = event.payload

  const status = STATUS_BY_EVENT[triggerEvent]
  if (!status || !booking?.uid) {
    // Not an event we track (e.g. MEETING_ENDED) -- acknowledge and ignore.
    return new Response('Ignored', { status: 200 })
  }

  const attendee = booking.attendees?.[0]
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  let leadId: string | null = null
  if (attendee?.email) {
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', attendee.email)
      .is('deleted_at', null)
      .maybeSingle()
    leadId = lead?.id ?? null
  }

  const { error } = await supabase.from('bookings').upsert(
    {
      cal_booking_uid: booking.uid,
      attendee_name: attendee?.name ?? 'Unknown',
      attendee_email: attendee?.email ?? '',
      attendee_phone: attendee?.phoneNumber ?? null,
      start_time: booking.startTime,
      end_time: booking.endTime,
      status,
      meeting_url: booking.videoCallData?.url ?? booking.location ?? null,
      cal_notes: booking.additionalNotes ?? null,
      lead_id: leadId,
      raw_payload: event,
    },
    { onConflict: 'cal_booking_uid' },
  )

  if (error) {
    console.error('Failed to upsert booking:', error)
    return new Response('Database error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
})
