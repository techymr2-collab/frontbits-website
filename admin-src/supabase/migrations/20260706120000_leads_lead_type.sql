-- Distinguish SaaS waitlist signups from The Build custom-project inquiries,
-- both of which now come through the same website contact-form pipeline.

alter table public.leads add column lead_type text not null default 'the_build';

alter table public.leads add constraint leads_lead_type_check
  check (lead_type in ('waitlist', 'the_build'));
