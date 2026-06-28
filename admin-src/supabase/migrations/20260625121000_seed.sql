-- Seed the one company_settings row. Idempotent: running this twice will
-- not create a second row.
--
-- The seed admin user is not created here. Create one user in Supabase
-- Auth (Dashboard > Authentication > Add user, or `supabase auth admin
-- create-user` via the CLI) and the handle_new_user trigger from the
-- profiles migration automatically makes the first such user an admin.

insert into public.company_settings (company_name, address, default_currency, default_vat_rate, invoice_prefix)
select 'Frontbits LLC', 'Dubai, United Arab Emirates', 'AED', 5, 'INV-'
where not exists (select 1 from public.company_settings);
