-- Structured fields for leads captured by the public contact form on the
-- marketing site, plus a dedicated 'website' source value so they're
-- distinguishable from leads added manually in the CRM.

alter table public.leads add column project_type text;
alter table public.leads add column budget_range text;

alter table public.leads drop constraint leads_source_check;
alter table public.leads add constraint leads_source_check
  check (source in ('referral', 'inbound', 'outbound', 'event', 'website', 'other'));
