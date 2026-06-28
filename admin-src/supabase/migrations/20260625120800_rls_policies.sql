-- Row Level Security. There is no public sign up, so the only way into the
-- app is a Supabase Auth account created by an admin. Every table below
-- denies anonymous access by default (RLS with no anon policy) and grants
-- full read and write to any signed in team member, since this is an
-- internal tool with no per-row ownership rules. profiles and
-- company_settings get tighter write rules.

alter table public.profiles enable row level security;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);
create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin());

alter table public.company_settings enable row level security;
create policy "company_settings_select_authenticated"
  on public.company_settings for select
  to authenticated
  using (true);
create policy "company_settings_update_admin"
  on public.company_settings for update
  to authenticated
  using (public.is_admin());

alter table public.clients enable row level security;
create policy "clients_all_authenticated"
  on public.clients for all
  to authenticated
  using (true) with check (true);

alter table public.contacts enable row level security;
create policy "contacts_all_authenticated"
  on public.contacts for all
  to authenticated
  using (true) with check (true);

alter table public.leads enable row level security;
create policy "leads_all_authenticated"
  on public.leads for all
  to authenticated
  using (true) with check (true);

alter table public.lead_notes enable row level security;
create policy "lead_notes_all_authenticated"
  on public.lead_notes for all
  to authenticated
  using (true) with check (true);

alter table public.projects enable row level security;
create policy "projects_all_authenticated"
  on public.projects for all
  to authenticated
  using (true) with check (true);

alter table public.tasks enable row level security;
create policy "tasks_all_authenticated"
  on public.tasks for all
  to authenticated
  using (true) with check (true);

alter table public.invoices enable row level security;
create policy "invoices_all_authenticated"
  on public.invoices for all
  to authenticated
  using (true) with check (true);

alter table public.invoice_line_items enable row level security;
create policy "invoice_line_items_all_authenticated"
  on public.invoice_line_items for all
  to authenticated
  using (true) with check (true);

alter table public.expenses enable row level security;
create policy "expenses_all_authenticated"
  on public.expenses for all
  to authenticated
  using (true) with check (true);
