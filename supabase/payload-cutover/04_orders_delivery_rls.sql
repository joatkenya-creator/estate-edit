-- =============================================================================
-- Phase 2 — Orders + Delivery RLS  (run AFTER `payload migrate` applies the
-- 20260624 phase2_orders_delivery migration)
-- =============================================================================
-- Payload connects as the privileged `postgres` role and BYPASSES RLS, so it is
-- unaffected. This re-establishes RLS for the PUBLIC site (Supabase anon key):
--
--   * orders   : anon/authenticated may INSERT only (self-checkout). No SELECT —
--                orders stay private; the confirmation page uses client-side
--                data, not a read-back.
--   * delivery : anon/authenticated may SELECT (the site reads the fee + the
--                "We deliver countrywide" copy). Single global row; never public-writable.
--
-- Idempotent: safe to re-run. Run as `postgres` (Supabase SQL editor does).
-- =============================================================================

-- ---- Orders: public INSERT (self-checkout) only ----------------------------
do $$
begin
  if to_regclass('public.orders') is null then
    raise notice 'orders not found — did `payload migrate` run? Skipping.';
    return;
  end if;

  alter table public.orders enable row level security;
  grant insert on public.orders to anon, authenticated;

  drop policy if exists "Public can place orders" on public.orders;
  create policy "Public can place orders"
    on public.orders for insert
    to anon, authenticated
    with check (true);

  -- The public site inserts via raw SQL (bypassing Payload), so any column it
  -- omits must have a DB default. Set them defensively so anon inserts never
  -- fail on a missing id/status/total/timestamp.
  begin execute 'alter table public.orders alter column id set default gen_random_uuid()'; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column status set default ''pending'''; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column payment_status set default ''unpaid'''; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column currency set default ''KES'''; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column subtotal set default 0'; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column delivery_fee set default 0'; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column total set default 0'; exception when others then raise notice '%', sqlerrm; end;
  begin execute 'alter table public.orders alter column amount_paid set default 0'; exception when others then raise notice '%', sqlerrm; end;
end $$;

-- ---- Defensive timestamp defaults on orders --------------------------------
do $$
declare
  c text;
  ts_cols text[] := array['created_at', 'updated_at', 'createdAt', 'updatedAt'];
begin
  if to_regclass('public.orders') is null then return; end if;
  foreach c in array ts_cols loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = c
    ) then
      execute format('alter table public.orders alter column %I set default now()', c);
    end if;
  end loop;
end $$;

-- ---- orders_payments (child table): lock down, no public access ------------
-- Written only by Payload (staff, bypasses RLS). Enable RLS with NO policy so
-- Supabase doesn't flag rls_disabled_in_public and anon gets zero access.
do $$
begin
  if to_regclass('public.orders_payments') is null then return; end if;
  alter table public.orders_payments enable row level security;
end $$;

-- ---- Delivery (global): public SELECT only ---------------------------------
do $$
begin
  if to_regclass('public.delivery') is null then
    raise notice 'delivery not found — skipping.';
    return;
  end if;

  alter table public.delivery enable row level security;
  grant select on public.delivery to anon, authenticated;

  drop policy if exists "Public can read delivery settings" on public.delivery;
  create policy "Public can read delivery settings"
    on public.delivery for select
    to anon, authenticated
    using (true);
end $$;
