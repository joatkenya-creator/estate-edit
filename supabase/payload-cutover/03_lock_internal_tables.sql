-- =============================================================================
-- Payload cutover — STEP 3: lock down Payload's internal / non-public tables
-- =============================================================================
-- Supabase's `rls_disabled_in_public` linter flags every table in the public
-- schema that has RLS disabled, because PostgREST can expose them to the anon
-- key. Payload created many such tables — including `users` (admin password
-- HASHES + salts), `users_sessions` (session tokens), the `_*_v` version/DRAFT
-- tables, `media`, and `payload_*` internals — that the PUBLIC site must never
-- read or write.
--
-- Fix: enable RLS (with NO policy => deny-all for anon/authenticated) and revoke
-- their grants on every currently-unprotected public table. The 6 content/lead
-- tables already carry RLS + their published-read / insert policies (step 2) and
-- have relrowsecurity = true, so this loop skips them.
--
-- Payload connects as the privileged `postgres` role, which BYPASSES RLS, so it
-- keeps full access — identical to the 6 tables already locked in step 2.
--
-- Idempotent: safe to re-run. Run as `postgres` (Supabase SQL editor does).
-- =============================================================================

do $$
declare
  t record;
  locked int := 0;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'              -- ordinary tables only
      and c.relrowsecurity = false     -- only those still unprotected
  loop
    execute format('alter table public.%I enable row level security', t.relname);
    execute format('revoke all on public.%I from anon, authenticated', t.relname);
    locked := locked + 1;
    raise notice 'Locked (RLS on, grants revoked): %', t.relname;
  end loop;

  raise notice 'Done. % table(s) locked.', locked;
end $$;
