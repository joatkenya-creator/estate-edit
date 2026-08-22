-- =============================================================================
-- Marketplace listing view counter — count every visitor, and stop a view from
-- falsifying the sitemap's <lastmod>.
--
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run as many times as you like.
--
-- THIS SCRIPT ADDS ONLY. It creates two functions and redefines one trigger in
-- place. It contains no statement that removes a table, a column, a row, or a
-- function, and it does not read or write any listing data. Your rows are not
-- touched by running it.
--
-- WHY IT IS NEEDED
--
-- 1. Views were counted with a read-then-write:
--        set views = <the number read when the page rendered> + 1
--    Two people opening the same listing in the same moment both read the same
--    number and both write the same number back, so one view disappears. On a
--    listing that is actually getting traffic — the one a seller cares about —
--    that undercounts. increment_listing_views does the addition inside
--    Postgres, where it happens atomically, so no click is lost.
--
-- 2. Every view refreshed updated_at, via the shared timestamp trigger. The
--    sitemap now publishes updated_at as each listing's <lastmod>, so a listing
--    that was merely LOOKED AT kept telling Google it had been edited. A
--    <lastmod> that always says "just now" is one Google learns to ignore.
--    The new trigger function leaves updated_at alone when the only thing that
--    changed is the view count, and behaves exactly as before for a real edit.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- BEFORE: what the counter looks like right now. Run this first if you want a
-- record to compare against afterwards.
-- -----------------------------------------------------------------------------
select slug, title, views, updated_at
  from public.user_listings
 where status = 'active'
 order by created_at desc;


-- -----------------------------------------------------------------------------
-- 1. Atomic increment
--
--    Adds n to a listing's view count in a single database operation. Only ever
--    increases the number, only for a listing that is currently active, and
--    only for the one id passed in.
-- -----------------------------------------------------------------------------
create or replace function public.increment_listing_views(
  p_listing_id uuid,
  p_increment  int default 1
)
returns integer
language sql
volatile
as $$
  update public.user_listings
     set views = views + greatest(coalesce(p_increment, 1), 0)
   where id = p_listing_id
     and status = 'active'
  returning views;
$$;


-- -----------------------------------------------------------------------------
-- 2. A timestamp trigger that ignores view-count-only changes
--
--    Same behaviour as the shared set_updated_at() for every real edit. The one
--    difference: if the ONLY column that changed is `views`, updated_at keeps
--    its existing value, so the sitemap keeps telling Google the truth about
--    when the listing last actually changed.
--
--    The original shared function is left exactly as it is and continues to run
--    on every other table.
-- -----------------------------------------------------------------------------
create or replace function public.user_listings_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- Compare the old and new row with `views` and `updated_at` taken out of the
  -- comparison. If nothing else differs, this was a view-count bump.
  if new.views is distinct from old.views
     and (to_jsonb(new) - 'views' - 'updated_at') = (to_jsonb(old) - 'views' - 'updated_at')
  then
    new.updated_at = old.updated_at;
  else
    new.updated_at = now();
  end if;
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Point the existing trigger at the new function
--
--    `create or replace trigger` (PostgreSQL 14+, so every current Supabase
--    project) redefines the trigger in place, in one statement. The trigger
--    keeps its name and its timing; only the function it calls changes. There
--    is no moment at which the table is left without a timestamp trigger.
-- -----------------------------------------------------------------------------
create or replace trigger user_listings_set_updated_at
  before update on public.user_listings
  for each row execute function public.user_listings_touch_updated_at();


-- -----------------------------------------------------------------------------
-- AFTER: confirm the trigger now runs the new function.
-- -----------------------------------------------------------------------------
select tgname as trigger_name, pg_get_triggerdef(oid) as definition
  from pg_trigger
 where tgrelid = 'public.user_listings'::regclass
   and not tgisinternal;


-- =============================================================================
-- OPTIONAL — verify the counter behaves, on one real listing
--
-- Run these three one at a time. `views` should go up by 1; `updated_at`
-- should not move at all. Nothing else about the listing changes.
--
--   select slug, views, updated_at from public.user_listings
--    where slug = 'treated-cyprus-wood-msykim3y';
--
--   select public.increment_listing_views(
--     (select id from public.user_listings where slug = 'treated-cyprus-wood-msykim3y')
--   );
--
--   select slug, views, updated_at from public.user_listings
--    where slug = 'treated-cyprus-wood-msykim3y';
--
-- =============================================================================
-- OPTIONAL — lock the function to the server
--
-- Postgres lets anyone execute a newly created function by default. As it
-- stands, that is bounded by your existing row-level security: a signed-out
-- visitor calling it changes nothing, and a signed-in user can only affect a
-- listing they own. The only thing possible is a seller inflating their own
-- view count.
--
-- To close even that, run the three lines below as a SEPARATE query. They
-- change permissions on the function this script just created and touch no
-- data — but they use the keyword the SQL editor warns about, which is why
-- they are not in the script above.
--
--   revoke execute on function public.increment_listing_views(uuid, int) from public;
--   revoke execute on function public.increment_listing_views(uuid, int) from anon, authenticated;
--   grant  execute on function public.increment_listing_views(uuid, int) to service_role;
--
-- The site works either way — it calls the function with the service-role key.
-- =============================================================================
