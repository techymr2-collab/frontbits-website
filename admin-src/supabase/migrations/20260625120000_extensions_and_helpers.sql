-- Extensions and shared helper functions used across later migrations.

create extension if not exists pgcrypto;

-- Generic trigger to keep an updated_at column current on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
