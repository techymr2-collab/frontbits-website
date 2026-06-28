-- Expenses, optionally tied to a project. receipt_path points at an object
-- in the "receipts" storage bucket (see the storage migration).

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  category text not null,
  vendor text,
  amount numeric(12, 2) not null,
  currency text not null default 'AED' check (currency in ('AED', 'USD')),
  project_id uuid references public.projects (id) on delete set null,
  notes text,
  receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index expenses_project_id_idx on public.expenses (project_id);
create index expenses_date_idx on public.expenses (date);

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();
