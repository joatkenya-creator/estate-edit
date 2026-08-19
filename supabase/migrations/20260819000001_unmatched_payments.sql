-- =============================================================================
-- Unmatched payments — money we took but couldn't apply.
--
-- listing_payments requires a real listing_id + user_id (both NOT NULL FKs), so
-- a charge whose listing is missing/unknown cannot be recorded there. Those used
-- to be dropped silently by the Paystack webhook: customer charged, listing
-- dead, nobody told. This table is the landing spot for every such charge so it
-- is queryable instead of invisible.
-- =============================================================================

create table if not exists unmatched_payments (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  provider    text not null default 'paystack',
  -- Unique so Paystack's webhook retries update one row instead of piling up.
  reference   text not null unique,

  amount      numeric(14,2),
  currency    text,
  -- Nullable on purpose: the whole point is that this listing may not exist.
  listing_id  uuid,
  reason      text not null,
  resolved_at timestamptz,

  payload     jsonb not null default '{}'::jsonb
);

create index if not exists unmatched_payments_unresolved_idx
  on unmatched_payments (created_at desc)
  where resolved_at is null;

-- No policies: service role only. Nothing client-side should ever read this.
alter table unmatched_payments enable row level security;
