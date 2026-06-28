-- Bookings synced from Cal.com via a webhook Edge Function. Cal.com is the
-- source of truth for attendee/time fields; this table mirrors it. Admins
-- can only add internal_notes and a manual lead link, never the synced
-- fields, so a later webhook delivery never fights with an admin edit.

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  cal_booking_uid text not null unique,
  attendee_name text not null,
  attendee_email text not null,
  attendee_phone text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'rescheduled')),
  meeting_url text,
  cal_notes text,
  internal_notes text,
  lead_id uuid references public.leads (id) on delete set null,
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_start_time_idx on public.bookings (start_time);
create index bookings_lead_id_idx on public.bookings (lead_id);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();
