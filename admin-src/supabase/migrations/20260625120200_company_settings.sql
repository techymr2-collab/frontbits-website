-- Single row of company wide settings used in Settings and on invoices.

create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Frontbits LLC',
  address text,
  trn text,
  logo_url text,
  default_currency text not null default 'AED' check (default_currency in ('AED', 'USD')),
  default_vat_rate numeric(5, 2) not null default 5,
  invoice_prefix text not null default 'INV-',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger company_settings_set_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

-- Keep this table to exactly one row.
create or replace function public.prevent_extra_company_settings()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.company_settings) >= 1 then
    raise exception 'company_settings holds one row only, update it instead of inserting a new one';
  end if;
  return new;
end;
$$;

create trigger company_settings_singleton
  before insert on public.company_settings
  for each row execute function public.prevent_extra_company_settings();
