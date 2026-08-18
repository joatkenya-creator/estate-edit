-- =============================================================================
-- Marketplace: user_listings -> user_profiles foreign key
-- =============================================================================
-- user_listings.user_id references auth.users(id). PostgREST cannot embed
-- across into the `auth` schema, so `select(... user_profiles ( full_name ))`
-- in the marketplace queries failed with PGRST200 ("no relationship found").
-- Both callers swallow the error and return empty:
--   * src/lib/queries.ts  -> marketplace grid rendered "No listings yet"
--   * src/app/marketplace/[slug]/page.tsx -> every listing page 404'd
--
-- user_profiles.id IS auth.users.id (1-to-1, created by the handle_new_user
-- trigger), so a second FK straight to user_profiles is safe and gives
-- PostgREST the relationship it needs. No app code changes.
-- =============================================================================

alter table public.user_listings
  drop constraint if exists user_listings_user_id_profile_fkey;

alter table public.user_listings
  add constraint user_listings_user_id_profile_fkey
  foreign key (user_id) references public.user_profiles (id) on delete cascade;

notify pgrst, 'reload schema';
