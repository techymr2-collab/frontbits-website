-- RLS for the new tables, matching the existing internal-tool pattern: full
-- access for any signed-in team member, no per-row ownership rules.

alter table public.bookings enable row level security;
create policy "bookings_all_authenticated"
  on public.bookings for all
  to authenticated
  using (true) with check (true);

alter table public.blog_posts enable row level security;
create policy "blog_posts_all_authenticated"
  on public.blog_posts for all
  to authenticated
  using (true) with check (true);

-- Leads is the one table a public, unauthenticated page writes to: the
-- marketing site's contact form. This grants insert only -- no select,
-- update, or delete -- so the anon key shipped in that page's public JS
-- can never read or modify existing rows, only create new ones.
create policy "leads_public_insert"
  on public.leads for insert
  to anon
  with check (true);
