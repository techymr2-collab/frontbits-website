-- The in-house accounting module (invoices, invoice line items, expenses)
-- was removed from the app on 2026-06-26 in favor of Zoho Books as the
-- system of record for invoicing, VAT, and Corporate Tax. This migration
-- drops the now-orphaned schema: the accounting tables and their
-- triggers/functions/sequence, the receipts/logos bucket policies, and the
-- company_settings columns that only existed to support invoicing.
--
-- The receipts/logos storage buckets themselves are NOT dropped here:
-- storage.objects/storage.buckets have a protective trigger that blocks
-- direct DELETE, so they must be removed via the Storage UI or Storage API
-- instead (see the dashboard Storage section).

-- invoice_line_items references invoices, so it must drop first.
drop table if exists public.invoice_line_items;
drop table if exists public.invoices;
drop table if exists public.expenses;

drop function if exists public.recalc_invoice_totals();
drop function if exists public.generate_invoice_number();

drop sequence if exists public.invoice_number_seq;

-- Drop the bucket access policies; the buckets are removed separately
-- through the Storage UI (protected against raw SQL deletion).
drop policy if exists "receipts_authenticated_all" on storage.objects;
drop policy if exists "logos_authenticated_all" on storage.objects;

-- company_settings: drop the columns that only existed for invoicing.
alter table public.company_settings
  drop column if exists logo_url,
  drop column if exists default_vat_rate,
  drop column if exists invoice_prefix;
