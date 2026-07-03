-- =============================================================================
-- Admin review queue view
-- =============================================================================
-- A ready-made, pre-filtered view of marketplace listings that need attention
-- (pending review or rejected), so staff can open it directly in the Supabase
-- Table Editor without using the (flaky) filter UI.
--
-- security_invoker = true -> the view runs with the caller's privileges + RLS,
-- and access is revoked from anon/authenticated, so ONLY the Supabase dashboard
-- / service role (which bypass RLS) can read it. Nothing is exposed publicly.
--
-- It is a simple single-table view, so it is auto-updatable: you can change the
-- `status` cell directly (approved items then leave the queue automatically).
-- =============================================================================

create or replace view public.listings_review_queue
with (security_invoker = true) as
select
  id,
  slug,
  title,
  description,
  category,
  condition,
  price,
  currency,
  location,
  primary_image_url,
  status,
  is_free_listing,
  listing_fee_paid,
  views,
  created_at,
  user_id
from public.user_listings
where status in ('pending_review', 'rejected')
order by created_at desc;

-- Lock it down: the public API roles cannot read it; only the dashboard can.
revoke all on public.listings_review_queue from anon, authenticated;
