-- Clients and their contacts.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  primary_contact_name text,
  email text,
  phone text,
  country text not null default 'UAE' check (country in ('UAE', 'UK', 'US', 'Canada', 'other')),
  city text,
  trn text,
  billing_currency text not null default 'AED' check (billing_currency in ('AED', 'USD')),
  billing_address text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index clients_status_idx on public.clients (status) where deleted_at is null;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_client_id_idx on public.contacts (client_id);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();
