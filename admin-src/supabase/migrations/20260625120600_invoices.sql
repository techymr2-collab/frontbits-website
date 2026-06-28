-- Invoices and their line items.
-- invoice_number is generated server side from a sequence plus the prefix
-- in company_settings, so numbering stays sequential even with concurrent
-- writes. subtotal, vat_total, and grand_total are recalculated by a
-- trigger whenever line items change, so they can never drift from the
-- line items they total.

create sequence public.invoice_number_seq start 1;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  project_id uuid references public.projects (id) on delete set null,
  invoice_number text unique,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Paid', 'Overdue')),
  currency text not null default 'AED' check (currency in ('AED', 'USD')),
  notes text,
  subtotal numeric(12, 2) not null default 0,
  vat_total numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index invoices_client_id_idx on public.invoices (client_id);
create index invoices_status_idx on public.invoices (status) where deleted_at is null;

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create or replace function public.generate_invoice_number()
returns trigger
language plpgsql
as $$
declare
  prefix text;
begin
  if new.invoice_number is not null then
    return new;
  end if;

  select invoice_prefix into prefix from public.company_settings limit 1;
  new.invoice_number := coalesce(prefix, 'INV-') || lpad(nextval('public.invoice_number_seq')::text, 4, '0');
  return new;
end;
$$;

create trigger invoices_generate_number
  before insert on public.invoices
  for each row execute function public.generate_invoice_number();

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  vat_rate numeric(5, 2) not null default 5,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index invoice_line_items_invoice_id_idx on public.invoice_line_items (invoice_id);

create or replace function public.recalc_invoice_totals()
returns trigger
language plpgsql
as $$
declare
  target_invoice_id uuid;
  new_subtotal numeric(12, 2);
  new_vat numeric(12, 2);
begin
  target_invoice_id := coalesce(new.invoice_id, old.invoice_id);

  select
    coalesce(sum(quantity * unit_price), 0),
    coalesce(sum(quantity * unit_price * vat_rate / 100.0), 0)
  into new_subtotal, new_vat
  from public.invoice_line_items
  where invoice_id = target_invoice_id;

  update public.invoices
  set subtotal = new_subtotal,
      vat_total = new_vat,
      grand_total = new_subtotal + new_vat
  where id = target_invoice_id;

  return null;
end;
$$;

create trigger invoice_line_items_recalc
  after insert or update or delete on public.invoice_line_items
  for each row execute function public.recalc_invoice_totals();
