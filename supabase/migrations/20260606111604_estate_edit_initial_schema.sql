-- =============================================================================
-- The Estate Edit — initial schema
-- Luxury estate sales · commercial liquidation · expat transition services
-- =============================================================================
-- Conventions:
--   * Every table has uuid PK, created_at, and (where mutable) updated_at.
--   * Row Level Security is ENABLED on every table.
--   * Public (anon) can READ only published content and SUBMIT inquiries.
--   * All writes to content tables go through the service-role key (server-side),
--     which bypasses RLS — so no public write policies are defined.
-- =============================================================================

-- Needed for gen_random_uuid() (present by default on Supabase, guarded anyway).
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums (controlled vocabularies)
-- -----------------------------------------------------------------------------
do $$ begin
  create type inquiry_type as enum ('consultation', 'asset_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum ('new', 'contacted', 'qualified', 'won', 'lost', 'archived');
exception when duplicate_object then null; end $$;

-- Who the client is (used by inquiries + testimonials).
do $$ begin
  create type client_segment as enum (
    'individual', 'family', 'estate_executor', 'business_owner',
    'expat', 'embassy', 'corporation'
  );
exception when duplicate_object then null; end $$;

-- The three+ service divisions the firm offers.
do $$ begin
  create type service_division as enum (
    'estate_sales', 'commercial_liquidation', 'concierge', 'expat_services'
  );
exception when duplicate_object then null; end $$;

-- Catalog categories spanning luxury estate + commercial assets.
do $$ begin
  create type asset_category as enum (
    'furniture', 'fine_art', 'jewelry', 'vehicles', 'collectibles',
    'designer', 'lighting', 'rugs', 'antiques',
    'equipment', 'fleet', 'inventory', 'office', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_status as enum ('available', 'reserved', 'pending', 'sold', 'withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_condition as enum ('new', 'excellent', 'very_good', 'good', 'fair');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_type as enum ('estate_sale', 'online_auction', 'liquidation', 'private_event');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('upcoming', 'live', 'ended', 'cancelled');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- updated_at trigger helper
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- inquiries — lead capture for "Book a Consultation" / "Request an Asset Review"
-- =============================================================================
create table if not exists inquiries (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  inquiry_type      inquiry_type   not null,
  status            inquiry_status not null default 'new',

  -- contact
  full_name         text not null,
  email             text not null,
  phone             text,
  company           text,
  preferred_contact text,                 -- 'email' | 'phone' | 'whatsapp'

  -- qualification
  client_segment    client_segment,
  service_division  service_division,
  location          text,                 -- e.g. Karen, Runda, Muthaiga, Westlands
  expat_direction   text,                 -- 'arrival' | 'departure' | null

  -- message
  subject           text,
  message           text,

  -- asset-review specifics
  asset_category     asset_category,
  asset_description  text,
  estimated_value    numeric(14,2),
  estimated_currency text not null default 'KES',

  -- meta
  consent           boolean not null default false,  -- privacy/contact consent
  source            text,                 -- page or CTA the lead came from
  metadata          jsonb   not null default '{}'::jsonb,

  constraint inquiries_email_check check (position('@' in email) > 1)
);

create index if not exists inquiries_created_at_idx on inquiries (created_at desc);
create index if not exists inquiries_status_idx     on inquiries (status);
create index if not exists inquiries_type_idx       on inquiries (inquiry_type);

create trigger inquiries_set_updated_at
  before update on inquiries
  for each row execute function set_updated_at();

-- =============================================================================
-- assets — luxury + commercial asset catalog (1stDibs-style gallery)
-- =============================================================================
create table if not exists assets (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  slug             text not null unique,
  title            text not null,
  description      text,

  division         service_division not null default 'estate_sales',
  category         asset_category   not null default 'other',
  status           asset_status     not null default 'available',
  condition        asset_condition,

  price            numeric(14,2),
  currency         text not null default 'KES',
  price_on_request boolean not null default false,

  brand            text,                 -- designer / maker / manufacturer
  era              text,                 -- year or period, e.g. "c. 1960s"
  provenance       text,
  dimensions       text,
  location         text,

  primary_image_url text,                -- denormalized cover image
  tags             text[] not null default '{}',

  is_featured      boolean not null default false,
  is_published     boolean not null default false,
  sort_order       integer not null default 0,
  metadata         jsonb   not null default '{}'::jsonb
);

create index if not exists assets_published_idx on assets (is_published) where is_published = true;
create index if not exists assets_featured_idx  on assets (is_featured)  where is_featured  = true;
create index if not exists assets_division_idx  on assets (division);
create index if not exists assets_category_idx  on assets (category);
create index if not exists assets_status_idx    on assets (status);
create index if not exists assets_sort_idx      on assets (sort_order);

create trigger assets_set_updated_at
  before update on assets
  for each row execute function set_updated_at();

-- =============================================================================
-- asset_images — ordered gallery images per asset
-- =============================================================================
create table if not exists asset_images (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  asset_id    uuid not null references assets (id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  integer not null default 0
);

create index if not exists asset_images_asset_idx on asset_images (asset_id, sort_order);

-- =============================================================================
-- sale_events — estate sales, online auctions & liquidation events
-- =============================================================================
create table if not exists sale_events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  slug            text not null unique,
  title           text not null,
  description     text,

  event_type      event_type   not null default 'estate_sale',
  status          event_status not null default 'upcoming',
  division        service_division not null default 'estate_sales',

  location        text,                  -- neighborhood / city
  address         text,
  starts_at       timestamptz,
  ends_at         timestamptz,

  cover_image_url text,
  is_featured     boolean not null default false,
  is_published    boolean not null default false,
  metadata        jsonb   not null default '{}'::jsonb
);

create index if not exists sale_events_published_idx on sale_events (is_published) where is_published = true;
create index if not exists sale_events_status_idx    on sale_events (status);
create index if not exists sale_events_starts_idx    on sale_events (starts_at);

create trigger sale_events_set_updated_at
  before update on sale_events
  for each row execute function set_updated_at();

-- =============================================================================
-- testimonials — client social proof, luxury presentation
-- =============================================================================
create table if not exists testimonials (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  author_name    text not null,
  author_role    text,                   -- e.g. "Estate Executor", "Expat Family"
  client_segment client_segment,
  quote          text not null,
  location       text,
  rating         smallint check (rating between 1 and 5),
  avatar_url     text,

  is_featured    boolean not null default false,
  is_published   boolean not null default false,
  sort_order     integer not null default 0
);

create index if not exists testimonials_published_idx on testimonials (is_published) where is_published = true;
create index if not exists testimonials_featured_idx  on testimonials (is_featured)  where is_featured  = true;

create trigger testimonials_set_updated_at
  before update on testimonials
  for each row execute function set_updated_at();

-- =============================================================================
-- services — the service divisions and their offerings (drives service pages)
-- =============================================================================
create table if not exists services (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  slug           text not null unique,
  division       service_division not null,
  title          text not null,
  summary        text,
  description    text,
  icon           text,                   -- icon key for the UI component
  offerings      text[] not null default '{}',  -- bullet list of sub-services
  hero_image_url text,

  is_published   boolean not null default true,
  sort_order     integer not null default 0
);

create index if not exists services_published_idx on services (is_published) where is_published = true;
create index if not exists services_division_idx  on services (division);

create trigger services_set_updated_at
  before update on services
  for each row execute function set_updated_at();

-- =============================================================================
-- site_stats — homepage "Why Estate Edit" metrics (admin-editable)
-- =============================================================================
create table if not exists site_stats (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  key          text not null unique,     -- 'assets_sold', 'estates_managed', ...
  label        text not null,
  value        numeric not null,
  prefix       text,                     -- e.g. 'KES'
  suffix       text,                     -- e.g. '+', 'M', '%'
  is_published boolean not null default true,
  sort_order   integer not null default 0
);

create trigger site_stats_set_updated_at
  before update on site_stats
  for each row execute function set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table inquiries    enable row level security;
alter table assets       enable row level security;
alter table asset_images enable row level security;
alter table sale_events  enable row level security;
alter table testimonials enable row level security;
alter table services     enable row level security;
alter table site_stats   enable row level security;

-- inquiries: anyone may submit; nobody may read/update/delete via the anon key.
create policy "Public can submit inquiries"
  on inquiries for insert
  to anon, authenticated
  with check (true);

-- assets: public can read only published rows.
create policy "Public can read published assets"
  on assets for select
  to anon, authenticated
  using (is_published = true);

-- asset_images: readable only when the parent asset is published.
create policy "Public can read images of published assets"
  on asset_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from assets a
      where a.id = asset_images.asset_id and a.is_published = true
    )
  );

-- sale_events: public can read only published rows.
create policy "Public can read published events"
  on sale_events for select
  to anon, authenticated
  using (is_published = true);

-- testimonials: public can read only published rows.
create policy "Public can read published testimonials"
  on testimonials for select
  to anon, authenticated
  using (is_published = true);

-- services: public can read only published rows.
create policy "Public can read published services"
  on services for select
  to anon, authenticated
  using (is_published = true);

-- site_stats: public can read only published rows.
create policy "Public can read published stats"
  on site_stats for select
  to anon, authenticated
  using (is_published = true);
