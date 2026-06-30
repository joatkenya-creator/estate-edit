-- =============================================================================
-- The Estate Edit — user marketplace
-- Extends the platform with Supabase Auth-based customer accounts,
-- user-posted listings (Jiji-inspired), and commission / fee tracking.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type listing_status as enum (
    'draft', 'pending_review', 'active', 'sold', 'withdrawn', 'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('listing_fee', 'commission');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'completed', 'failed');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- user_profiles — extends auth.users with public-facing profile info
-- id matches auth.users.id (1-to-1)
-- -----------------------------------------------------------------------------
create table if not exists user_profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  full_name             text,
  phone                 text,
  bio                   text,
  avatar_url            text,
  location              text,                        -- Nairobi, Mombasa, etc.

  -- Marketplace tier tracking
  free_listings_used    int not null default 0,      -- how many of the 2 free slots used
  free_listings_sold    int not null default 0,      -- how many free listings resulted in a sale

  is_verified           boolean not null default false,
  is_active             boolean not null default true,

  metadata              jsonb not null default '{}'::jsonb
);

create trigger user_profiles_set_updated_at
  before update on user_profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up
-- NOTE: `set search_path = public` is REQUIRED. This SECURITY DEFINER trigger
-- runs as supabase_auth_admin (whose search_path is just `auth`), so an
-- unqualified `user_profiles` can't be resolved → signup fails with
-- "Database error saving new user". Pin the path AND schema-qualify the table.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------------
-- user_listings — items posted by users for sale
-- -----------------------------------------------------------------------------
create table if not exists user_listings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  user_id               uuid not null references auth.users (id) on delete cascade,
  slug                  text not null unique,

  -- Content
  title                 text not null,
  description           text,
  category              asset_category not null default 'other',
  condition             asset_condition,
  price                 numeric(14,2) not null,
  currency              text not null default 'KES',
  location              text,                        -- Where item is located
  primary_image_url     text,
  tags                  text[] not null default '{}',

  -- Lifecycle
  status                listing_status not null default 'draft',

  -- Free / paid tier
  is_free_listing       boolean not null default true,
  listing_fee_paid      boolean not null default false,
  listing_fee_amount    numeric(14,2) not null default 500,  -- KES 500

  -- Sale tracking
  sold_price            numeric(14,2),
  sold_at               timestamptz,

  -- Commission (10% of sale)
  commission_rate       numeric(5,2) not null default 10.00, -- percent
  commission_amount     numeric(14,2),
  commission_collected  boolean not null default false,

  -- Stats
  views                 int not null default 0,

  metadata              jsonb not null default '{}'::jsonb,

  constraint user_listings_price_check check (price > 0)
);

create index if not exists user_listings_user_idx     on user_listings (user_id);
create index if not exists user_listings_status_idx   on user_listings (status);
create index if not exists user_listings_category_idx on user_listings (category);
create index if not exists user_listings_created_idx  on user_listings (created_at desc);

create trigger user_listings_set_updated_at
  before update on user_listings
  for each row execute function set_updated_at();

-- Auto-compute commission when a listing is marked sold
create or replace function compute_listing_commission()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'sold' and old.status <> 'sold' then
    new.sold_at      = coalesce(new.sold_at, now());
    new.sold_price   = coalesce(new.sold_price, new.price);
    new.commission_amount = round(new.sold_price * (new.commission_rate / 100), 2);
  end if;
  return new;
end;
$$;

create trigger user_listings_commission_trigger
  before update on user_listings
  for each row execute function compute_listing_commission();

-- When a free listing is sold, increment the seller's free_listings_sold counter
create or replace function increment_free_listings_sold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'sold' and old.status <> 'sold' and new.is_free_listing = true then
    update public.user_profiles
       set free_listings_sold = free_listings_sold + 1
     where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger user_listings_sold_trigger
  after update on user_listings
  for each row execute function increment_free_listings_sold();

-- -----------------------------------------------------------------------------
-- user_listing_images — ordered gallery images for each listing
-- -----------------------------------------------------------------------------
create table if not exists user_listing_images (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  listing_id  uuid not null references user_listings (id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int not null default 0
);

create index if not exists user_listing_images_listing_idx on user_listing_images (listing_id, sort_order);

-- -----------------------------------------------------------------------------
-- listing_payments — M-Pesa listing fee + commission payment records
-- -----------------------------------------------------------------------------
create table if not exists listing_payments (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  listing_id                uuid not null references user_listings (id) on delete cascade,
  user_id                   uuid not null references auth.users (id) on delete cascade,

  transaction_type          transaction_type not null,
  amount                    numeric(14,2) not null,
  currency                  text not null default 'KES',
  status                    payment_status not null default 'pending',

  -- M-Pesa Daraja fields
  mpesa_phone               text,
  mpesa_checkout_request_id text,
  mpesa_merchant_request_id text,
  mpesa_transaction_id      text,
  mpesa_result_code         int,
  mpesa_result_desc         text,
  paid_at                   timestamptz,

  metadata                  jsonb not null default '{}'::jsonb
);

create index if not exists listing_payments_listing_idx on listing_payments (listing_id);
create index if not exists listing_payments_user_idx    on listing_payments (user_id);
create index if not exists listing_payments_status_idx  on listing_payments (status);

create trigger listing_payments_set_updated_at
  before update on listing_payments
  for each row execute function set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table user_profiles        enable row level security;
alter table user_listings        enable row level security;
alter table user_listing_images  enable row level security;
alter table listing_payments     enable row level security;

-- user_profiles: owner can read/update their own profile; public can read basics
create policy "Users can read any profile"
  on user_profiles for select
  to anon, authenticated
  using (is_active = true);

create policy "Users can update own profile"
  on user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- user_listings: public can see active listings; owners have full CRUD
create policy "Public can read active listings"
  on user_listings for select
  to anon, authenticated
  using (status = 'active');

create policy "Owners can read own listings"
  on user_listings for select
  to authenticated
  using (user_id = auth.uid());

create policy "Authenticated users can create listings"
  on user_listings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Owners can update own listings"
  on user_listings for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Owners can delete draft listings"
  on user_listings for delete
  to authenticated
  using (user_id = auth.uid() and status = 'draft');

-- user_listing_images: mirrors parent listing visibility
create policy "Public can read images of active listings"
  on user_listing_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from user_listings l
      where l.id = user_listing_images.listing_id
        and (l.status = 'active' or l.user_id = auth.uid())
    )
  );

create policy "Owners can manage listing images"
  on user_listing_images for insert
  to authenticated
  with check (
    exists (
      select 1 from user_listings l
      where l.id = user_listing_images.listing_id and l.user_id = auth.uid()
    )
  );

create policy "Owners can delete listing images"
  on user_listing_images for delete
  to authenticated
  using (
    exists (
      select 1 from user_listings l
      where l.id = user_listing_images.listing_id and l.user_id = auth.uid()
    )
  );

-- listing_payments: owners can read their own payments; no client writes
create policy "Owners can read own payments"
  on listing_payments for select
  to authenticated
  using (user_id = auth.uid());
