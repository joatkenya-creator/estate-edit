-- =============================================================================
-- Marketplace sellers overview (admin)
-- =============================================================================
-- Sellers register themselves on the public site and post their own listings.
-- This view is the Supabase-dashboard counterpart of the CMS "Sellers" screen:
-- one row per seller, with their contact details and listing counts, so staff
-- can see how many sellers there are and what they have posted without
-- assembling the joins by hand in the Table Editor.
--
-- security_invoker = true -> runs with the caller's privileges + RLS, and
-- access is revoked from anon/authenticated, so ONLY the Supabase dashboard /
-- service role (which bypass RLS) can read it. Nothing is exposed publicly.
--
-- To DELETE a seller, delete the user under Authentication > Users: that
-- cascades to user_profiles and user_listings. Deleting a row here does
-- nothing — an aggregate view is not updatable.
-- =============================================================================

create or replace view public.sellers_overview
with (security_invoker = true) as
select
  p.id,
  p.full_name,
  u.email,
  p.phone,
  p.location,
  p.free_listings_used,
  p.is_verified,
  p.created_at                                        as joined_at,
  count(l.id)                                         as listings_total,
  count(l.id) filter (where l.status = 'active')      as listings_active,
  count(l.id) filter (where l.status = 'sold')        as listings_sold,
  count(l.id) filter (where l.status = 'draft')       as listings_draft,
  count(l.id) filter (where l.status = 'withdrawn')   as listings_withdrawn,
  max(l.created_at)                                   as last_listed_at
from public.user_profiles p
left join public.user_listings l on l.user_id = p.id
left join auth.users u           on u.id = p.id
group by p.id, u.email
order by count(l.id) desc, p.created_at desc;

-- Lock it down: the public API roles cannot read it; only the dashboard can.
revoke all on public.sellers_overview from anon, authenticated;
