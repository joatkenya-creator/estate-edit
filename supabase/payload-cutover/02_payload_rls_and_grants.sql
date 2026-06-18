-- =============================================================================
-- Payload cutover — STEP 2 of 2 (run AFTER `payload migrate` + `migrate:legacy`)
-- =============================================================================
-- Payload owns the new tables and connects as the privileged `postgres` role,
-- which BYPASSES RLS — so Payload is unaffected by anything here. This script
-- re-establishes the Row Level Security the PUBLIC site depends on, because the
-- public site reads/writes with the Supabase anon key (RLS enforced).
--
--   * Content tables: anon/authenticated may SELECT only PUBLISHED rows
--     (Payload drafts expose publish state via the `_status` column).
--   * inquiries:       anon/authenticated may INSERT (lead capture) only.
--
-- Idempotent: safe to re-run. Run as `postgres` (Supabase SQL editor does).
-- =============================================================================

-- ---- Published-content read access -----------------------------------------
do $$
declare
  t text;
  content_tables text[] := array[
    'assets', 'sale_events', 'services', 'testimonials', 'site_stats'
  ];
begin
  foreach t in array content_tables loop
    if to_regclass('public.' || t) is null then
      raise notice 'Table % not found — did `payload migrate` run? Skipping.', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('drop policy if exists "Public can read published %I" on public.%I', t, t);
    execute format(
      'create policy "Public can read published %I" on public.%I '
      || 'for select to anon, authenticated using (_status = ''published'')',
      t, t
    );
    raise notice 'RLS + published-read policy applied to %', t;
  end loop;
end $$;

-- ---- Inquiries: public INSERT (lead capture) only --------------------------
do $$
begin
  if to_regclass('public.inquiries') is null then
    raise notice 'inquiries not found — skipping.';
    return;
  end if;

  alter table public.inquiries enable row level security;
  grant insert on public.inquiries to anon, authenticated;

  drop policy if exists "Public can submit inquiries" on public.inquiries;
  create policy "Public can submit inquiries"
    on public.inquiries for insert
    to anon, authenticated
    with check (true);

  -- The public site inserts via raw SQL (bypassing Payload), so the columns it
  -- omits must have DB defaults. Payload normally sets these, but enforce them
  -- defensively so anon inserts never fail on a missing id/timestamp.
  begin
    execute 'alter table public.inquiries alter column id set default gen_random_uuid()';
  exception when others then
    raise notice 'Could not set id default (may already be set): %', sqlerrm;
  end;

  -- `status` is NOT NULL but Payload's default is app-level; give the column a
  -- DB default so direct anon inserts that omit it still succeed.
  begin
    execute 'alter table public.inquiries alter column status set default ''new''';
  exception when others then
    raise notice 'Could not set status default: %', sqlerrm;
  end;
end $$;

-- ---- Defensive timestamp defaults on inquiries -----------------------------
-- Handle either snake_case or camelCase column naming from the Drizzle schema.
do $$
declare
  c text;
  ts_cols text[] := array['created_at', 'updated_at', 'createdAt', 'updatedAt'];
begin
  foreach c in array ts_cols loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'inquiries' and column_name = c
    ) then
      execute format('alter table public.inquiries alter column %I set default now()', c);
    end if;
  end loop;
end $$;
