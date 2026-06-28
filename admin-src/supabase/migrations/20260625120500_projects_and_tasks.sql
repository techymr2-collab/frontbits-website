-- Projects and their task board.
-- budget holds the resolved amount whether it came from a pricing tier or a
-- custom figure. The Starter/Growth/Scale to AED mapping lives in the app
-- (src/lib/constants.ts), not in the database.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  name text not null,
  description text,
  status text not null default 'Discovery' check (status in ('Discovery', 'In Progress', 'Review', 'Delivered', 'On Hold')),
  pricing_tier text not null default 'Custom' check (pricing_tier in ('Starter', 'Growth', 'Scale', 'Custom')),
  budget numeric(12, 2) not null default 0,
  currency text not null default 'AED' check (currency in ('AED', 'USD')),
  start_date date,
  target_delivery_date date,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index projects_client_id_idx on public.projects (client_id);
create index projects_status_idx on public.projects (status) where deleted_at is null;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  status text not null default 'To Do' check (status in ('To Do', 'Doing', 'Done')),
  due_date date,
  assignee_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks (project_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
