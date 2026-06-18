-- =============================================================================
-- Payload cutover — STEP 1 of 2 (run BEFORE `payload migrate`)
-- =============================================================================
-- Payload claims the canonical table names (assets, services, …). To avoid a
-- collision and to preserve the current data for the one-time migration, rename
-- the existing hand-rolled tables to `*_legacy`. Idempotent: safe to re-run.
--
-- After this, run (in estate-edit-cms):   npm run migrate  &&  npm run migrate:legacy
-- Then apply 02_payload_rls_and_grants.sql.
-- =============================================================================

do $$
declare
  t text;
  legacy_tables text[] := array[
    'asset_images',   -- rename children first (FK to assets)
    'assets',
    'sale_events',
    'services',
    'testimonials',
    'site_stats',
    'inquiries'
  ];
begin
  foreach t in array legacy_tables loop
    -- Only rename if the live table exists and the legacy copy does not yet.
    if to_regclass('public.' || t) is not null
       and to_regclass('public.' || t || '_legacy') is null then
      execute format('alter table public.%I rename to %I', t, t || '_legacy');
      raise notice 'Renamed % -> %_legacy', t, t;
    else
      raise notice 'Skipped % (missing, or *_legacy already exists)', t;
    end if;
  end loop;
end $$;
