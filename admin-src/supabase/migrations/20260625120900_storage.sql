-- Private storage buckets for expense receipts and the company logo.
-- Both are private (public = false); access goes through signed URLs or
-- the authenticated policies below, never anonymous.

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', false)
on conflict (id) do nothing;

create policy "receipts_authenticated_all"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'receipts')
  with check (bucket_id = 'receipts');

create policy "logos_authenticated_all"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'logos')
  with check (bucket_id = 'logos');
