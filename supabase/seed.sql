-- =============================================================================
-- The Estate Edit — content seed (idempotent)
-- =============================================================================
-- Applied to the remote DB via the Management API. Safe to re-run: services,
-- site_stats, and assets upsert on their natural keys; testimonials seed only
-- when the table is empty. Replace the Unsplash imagery with the client's own
-- photography (upload to the `asset-images` storage bucket) when available.

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
insert into services (slug, division, title, summary, icon, offerings, is_published, sort_order)
values
  (
    'estate-sales', 'estate_sales', 'Estate Sales',
    'Full-service management and sale of luxury households, inherited estates, fine art, jewellery, and collector vehicles.',
    'estate',
    array['Inventory & cataloguing','Editorial photography','Pricing & valuation','Private buyer outreach','Luxury estate events','Consignment sales'],
    true, 1
  ),
  (
    'commercial-liquidation', 'commercial_liquidation', 'Commercial Liquidation',
    'Discreet, value-maximising disposal of business assets for closures, relocations, and fleet or warehouse reductions.',
    'commercial',
    array['Asset inventory & cataloguing','Equipment & fleet liquidation','Buyer sourcing','Online auctions','Direct & negotiated sales','Warehouse clearance'],
    true, 2
  ),
  (
    'concierge-transition', 'concierge', 'Concierge Transition',
    'White-glove support for major life changes — downsizing, relocation, cleanouts, and complete property preparation.',
    'concierge',
    array['Downsizing & relocation','Estate cleanouts','Property preparation','Donation coordination','Vendor management','Storage solutions'],
    true, 3
  )
on conflict (slug) do update set
  division = excluded.division,
  title = excluded.title,
  summary = excluded.summary,
  icon = excluded.icon,
  offerings = excluded.offerings,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Site stats
-- ---------------------------------------------------------------------------
insert into site_stats (key, label, value, prefix, suffix, is_published, sort_order)
values
  ('assets_sold',         'Assets sold',           2400, null,   '+', true, 1),
  ('estates_managed',     'Estates managed',        180, null,   '+', true, 2),
  ('businesses_assisted', 'Businesses assisted',     65, null,   '+', true, 3),
  ('value_realised',      'Client value realised',  1.2, 'KES ', 'B', true, 4)
on conflict (key) do update set
  label = excluded.label,
  value = excluded.value,
  prefix = excluded.prefix,
  suffix = excluded.suffix,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Featured assets
-- ---------------------------------------------------------------------------
insert into assets (slug, title, division, category, status, currency, price_on_request, primary_image_url, is_featured, is_published, sort_order, metadata)
values
  (
    'italian-walnut-suite', 'Italian Walnut Dining Suite', 'estate_sales', 'furniture', 'available', 'KES', true,
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
    true, true, 1, '{"meta":"Karen Estate · Seats 12","tone":"navy"}'::jsonb
  ),
  (
    'land-cruiser-vx', 'Land Cruiser VX — 2022', 'estate_sales', 'vehicles', 'reserved', 'KES', true,
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    true, true, 2, '{"meta":"Single owner · 18,000 km","tone":"charcoal"}'::jsonb
  ),
  (
    'contemporary-canvas', 'Contemporary East African Canvas', 'estate_sales', 'fine_art', 'available', 'KES', true,
    'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?auto=format&fit=crop&w=1000&q=80',
    true, true, 3, '{"meta":"Signed · Provenance verified","tone":"crimson"}'::jsonb
  ),
  (
    'diamond-solitaire', 'Diamond Solitaire, 3.1ct', 'estate_sales', 'jewelry', 'sold', 'KES', true,
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    true, true, 4, '{"meta":"GIA certified · Platinum","tone":"gold"}'::jsonb
  ),
  (
    'commercial-kitchen', 'Commercial Kitchen Line', 'commercial_liquidation', 'equipment', 'available', 'KES', true,
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80',
    true, true, 5, '{"meta":"Hotel-grade · 40 lots","tone":"navy"}'::jsonb
  ),
  (
    'executive-fleet', 'Executive Sedan Fleet', 'commercial_liquidation', 'fleet', 'available', 'KES', true,
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
    true, true, 6, '{"meta":"Corporate downsizing · 8 units","tone":"charcoal"}'::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  division = excluded.division,
  category = excluded.category,
  status = excluded.status,
  primary_image_url = excluded.primary_image_url,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata;

-- ---------------------------------------------------------------------------
-- Testimonials (seed only when empty)
-- ---------------------------------------------------------------------------
insert into testimonials (author_name, author_role, client_segment, quote, location, rating, is_featured, is_published, sort_order)
select * from (values
  (
    'A. Mwangi', 'Estate Executor', 'estate_executor'::client_segment,
    'They turned an overwhelming family estate into a calm, dignified process — and realised far more than we expected.',
    'Muthaiga', 5::smallint, true, true, 1
  ),
  (
    'Country Director', 'Multinational Corporation', 'corporation'::client_segment,
    'Relocating our regional office could have been chaos. The Estate Edit liquidated everything with total discretion.',
    'Westlands', 5::smallint, true, true, 2
  ),
  (
    'The Bauer Family', 'Expat Departure', 'expat'::client_segment,
    'As an expat family leaving Nairobi, they handled our entire household sale and move. White-glove from start to finish.',
    'Runda', 5::smallint, true, true, 3
  )
) as v(author_name, author_role, client_segment, quote, location, rating, is_featured, is_published, sort_order)
where not exists (select 1 from testimonials);
