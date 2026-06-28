-- Leads and the notes timeline shown on the lead detail page.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text not null default 'other' check (source in ('referral', 'inbound', 'outbound', 'event', 'other')),
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost')),
  estimated_value numeric(12, 2),
  currency text not null default 'AED' check (currency in ('AED', 'USD')),
  owner_id uuid references public.profiles (id) on delete set null,
  notes text,
  next_follow_up_date date,
  converted_client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index leads_status_idx on public.leads (status) where deleted_at is null;
create index leads_owner_idx on public.leads (owner_id);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index lead_notes_lead_id_idx on public.lead_notes (lead_id);
