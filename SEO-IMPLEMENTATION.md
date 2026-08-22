# Marketplace SEO — implementation report

Scope: technical SEO, local (Kenya) relevance, indexability and conversion for the
Estate Edit Marketplace, with Dominic Ongeri's two Ngong Road furniture listings as
the immediate target. Everything below is in the codebase unless it appears under
**Manual actions**.

---

## A. What changed

### The core: a reusable listing-SEO system

`src/lib/marketplace.ts` is the single source of truth. Every listing page,
category page, sitemap entry, OG tag, image alt and JSON-LD block reads from it,
so **a new paid listing inherits the whole treatment the moment it goes active** —
no per-listing work.

It derives, from fields the seller already fills in:

| Derivation | Example |
|---|---|
| SEO title | `Treated Cyprus Wood 5/6 Bed for Sale in Ngong Road, Nairobi` |
| Meta description | place + price + a real detail from the seller + next step |
| H1 | the same sentence as the title tag (SERP ↔ page match) |
| Image alt | `Treated Cyprus Wood 5/6 Bed (new) for sale in Ngong Road, Nairobi` |
| Place | `"Ngong road opposite Raila odinga stadium"` → **Ngong Road, Nairobi** |
| Category | `fine_art` → `Fine Art`, URL segment `fine-art` |
| Enquiry text | prefilled WhatsApp/email message naming the item and price |

Nothing is invented. An empty field is omitted, an unrecognised location keeps the
seller's own words and gets **no** location landing page, and a title that would
overflow the SERP degrades (neighbourhood → city) rather than being truncated
mid-word. `src/lib/marketplace.check.ts` asserts all of this
(`node --experimental-strip-types src/lib/marketplace.check.ts`).

### Listing pages (`/marketplace/[slug]`)

- Unique title tag, meta description, H1, OG and Twitter cards per listing —
  previously the title tag was the raw seller title with the site name appended twice.
- **Product JSON-LD** rebuilt: real `price`/`priceCurrency` (KES), `itemCondition`,
  `category`, `availableAtOrFrom` with the item's actual Kenyan locality,
  `areaServed: Kenya`, and the **seller as a Person** rather than the platform.
  No rating, no review, no fabricated stock claim.
- **BreadcrumbList JSON-LD** + a matching visible breadcrumb:
  Home → Marketplace → Furniture → Ngong Road, Nairobi → item.
- **Item details table** built only from fields that have data (category, condition,
  location, price, seller, listed date, availability).
- Images moved from raw `<img>` to `next/image`: width/height (no layout shift),
  responsive `srcset`, WebP/AVIF, `priority` on the LCP image, lazy below the fold.
- **Related listings** (4, same category first) — real internal links out of every
  listing page.
- Share row (WhatsApp / Facebook / copy link) reusing the existing component.
- Canonical points at the listing's own market host, derived from its currency.
- The listing read is now cached and anon-client based, so a crawler hit no longer
  forces a per-request, uncacheable Supabase round trip.

### Crawlable category and location pages (new)

```
/marketplace/furniture
/marketplace/furniture/ngong-road
/marketplace/furniture/nairobi
/marketplace/fine-art        … 14 categories
```

`?category=` filters can't rank — one URL wearing many hats. These are real paths
with their own title, description, H1, breadcrumb, canonical and ItemList schema.
Guardrails against thin content:

- Location pages exist **only** for places a real listing resolves to.
- A category or location page with zero listings is `noindex, follow`.
- Only stocked combinations are submitted in the sitemap.
- `?category=` / `?q=` views are `noindex, follow` and canonical to `/marketplace`.

**City pages roll up their neighbourhoods.** Sellers type a street, never a
city — "Ngong road opposite Raila odinga stadium" — so matching a location page
by exact slug left `/marketplace/furniture/nairobi` permanently empty (and
therefore noindexed) while `/marketplace/furniture/ngong-road` held everything.
A Ngong Road listing now appears on both. That matters because
*"furniture for sale in Nairobi"* is the query with volume behind it, and the
city page is the one that can win it.

**A neighbourhood page that duplicates its city canonicals to the city.** With
only two Nairobi furniture listings, `/furniture/ngong-road` and
`/furniture/nairobi` show an identical set — the same page twice, competing with
itself. The narrower one points its canonical at the city and is left out of the
sitemap. As soon as a second Nairobi neighbourhood posts furniture the two
diverge, the canonical becomes self-referencing again, and the page enters the
sitemap — no intervention. Expect GSC to report the neighbourhood URL as
*"Alternate page with proper canonical tag"*; that is the healthy state, not an
error.

There is no route collision: every listing slug ends in a base-36 timestamp, so no
listing can ever be named `furniture`.

### Internal linking

| From | To | Was |
|---|---|---|
| Homepage | new Marketplace section: 4 newest listings + 8 category links | no link at all |
| Footer | new Marketplace column (7 links into category pages) | no link at all |
| Marketplace index | category + location landing pages, services, collection | query-string filters |
| Category page | its locations, sibling categories, every listing | — |
| Listing page | category, location, 4 related listings | back-link only |
| Area pages (Karen, Westlands…) | listings physically in that area + category/area pages | — |
| Buying guide | furniture category + 4 furniture/location pages | — |

### Site-wide technical

- **Middleware matcher narrowed** to `/account`, `/sell/post`, `/auth`. It previously
  ran on *every* request, putting a Supabase `auth.getUser()` network round-trip in
  front of every public page render — homepage, collection, marketplace, every
  listing. This is the single largest TTFB change in this work.
- **robots.txt**: `/account`, `/auth/`, `/checkout`, `/sell/post`, `/api/`, `/feed/`
  and `?q=` search URLs disallowed; everything public still open.
- **Sitemap**: marketplace listings raised to priority 0.8 with their *real*
  `updated_at` as `<lastmod>` (was "now" for every URL, a signal Google learns to
  ignore); category and category+location pages added; guide added.
- **`WebSite` + `SearchAction` JSON-LD** in the root layout alongside `Organization`.
- **Branded 404** (`src/app/not-found.tsx`) — sold and withdrawn listings land here,
  so it links to the marketplace, every primary category, and the main pages.
  `noindex, follow`.

### Analytics & seller traction

- `src/lib/analytics.ts` — a no-op-safe wrapper over the gtag queue already loaded
  (no new dependency, no second analytics runtime).
- Events: `listing_view`, `whatsapp_click`, `phone_click`, `enquiry_click`,
  `seller_contact`, `marketplace_search`.
- **View counter fixed — three separate faults.** Sellers judge the platform on
  this number, so it has to be right.
  1. *It counted almost nobody.* Views were written with the cookie-bound
     client, and RLS only lets a listing's **owner** update the row — every
     visitor who wasn't the seller was silently rejected. Now written with the
     service-role client, so **every page load counts, signed in or not**.
  2. *It lost concurrent views.* The write was a read-modify-write
     (`views = <value read at render> + n`), so two people opening the same
     listing at once both wrote the same number and one view vanished. The
     addition now happens inside Postgres via `increment_listing_views`, which
     is atomic.
  3. *It counted robots.* Googlebot, Bingbot, AhrefsBot and the WhatsApp/
     Facebook link-preview fetchers all loaded the page. They are filtered by
     user-agent before anything is counted — a share generates one preview
     fetch regardless of how many people read it, and inflating the figure
     exactly when a listing starts ranking is the worst possible time.

  Writes are still batched through KV (at most one per listing per minute) but
  nothing is dropped: the buffer carries the full pending delta, so N clicks in
  a minute add N. The displayed figure can be up to a minute behind.

  **Requires `supabase/listing-views.sql` to be run** — until then the RPC does
  not exist and the page logs `increment_listing_views failed` rather than
  failing silently.
- Seller dashboard cards now show category (linked to its live landing page),
  location and listed date alongside views and status.

### Content

`/guides/buying-wooden-furniture-in-nairobi` — a genuine buying checklist (treated
timber, Kenyan bed sizing, a five-minute inspection, buying safely from a private
seller) that links into the furniture category and four furniture/location pages,
and shows live furniture listings. This is the template for the rest of the
editorial plan in section G.

---

## B. The two seller listings

Both are `status = active`, `currency = KES`, category `furniture`, condition `new`,
location `Ngong road opposite Raila odinga stadium` → resolved to **Ngong Road, Nairobi**.

### Listing 1 — the bed

| | |
|---|---|
| URL | `https://estateedit.org/marketplace/treated-cyprus-wood-msykim3y` |
| Canonical | self-referencing, apex host |
| Title tag | `Treated Cyprus Wood 5/6 Bed for Sale in Ngong Road, Nairobi` (59 chars) |
| Meta description | `Treated Cyprus Wood 5/6 Bed for sale in Ngong Road, Nairobi — KES 30,000. Size: 200cm by 152cm. Photos and seller contact on The Estate Edit Marketplace.` (153 chars) |
| H1 | same as the title tag |
| Primary theme | *treated wooden bed for sale Nairobi* / *5 by 6 bed Kenya* / *cypress wood bed Ngong Road* |
| Breadcrumb | Home → Marketplace → Furniture → Ngong Road, Nairobi → item |
| Product schema | ✅ price 30000, priceCurrency KES, NewCondition, InStock, seller Dominic Ongeri (Person), availableAtOrFrom Ngong Road / Nairobi / KE |
| Image alt | `Treated Cyprus Wood 5/6 Bed (new) for sale in Ngong Road, Nairobi` |
| Sitemap | ✅ priority 0.8, real lastmod |

### Listing 2 — the dining set

| | |
|---|---|
| URL | `https://estateedit.org/marketplace/treated-cyprus-wood-msyfd4pt` |
| Title tag | `Treated Cyprus Wood Dining Table & 6 Chairs for Sale in Nairobi` (63 chars) |
| Meta description | `Treated Cyprus Wood Dining Table & 6 Chairs for sale in Ngong Road, Nairobi — KES 58,000. Table size: 180cm long x 100cm deep x 80cm high.` (138 chars) |
| Primary theme | *dining table and 6 chairs Nairobi* / *wooden dining table set Kenya* |
| Product schema | ✅ price 58000, priceCurrency KES, NewCondition, InStock, seller Dominic Ongeri (Person) |
| Sitemap | ✅ priority 0.8, real lastmod |

> **⚠ One thing code cannot do.** Both rows are currently titled *exactly*
> `Treated Cyprus wood`. Two live pages with an identical title compete with each
> other and Google drops one as a duplicate — and no derivation can invent the noun
> that tells a searcher which is the bed and which is the dining set.
> **Run `supabase/seo-listing-copy.sql` in the Supabase SQL editor** (30 seconds).
> It sets the two titles above and tidies the descriptions, using only facts the
> seller already wrote. The titles in this section are what you get *after* that run;
> until then both pages read `Treated Cyprus wood for Sale in Ngong Road, Nairobi | Estate Edit`.

### Per-listing checklist

| Check | L1 | L2 |
|---|---|---|
| SEO title (unique) | ✅ after SQL | ✅ after SQL |
| Meta description (unique) | ✅ | ✅ |
| H1 | ✅ | ✅ |
| SEO-friendly URL | ✅ | ✅ |
| Self-referencing canonical | ✅ | ✅ |
| Indexable (no noindex, no auth, 200) | ✅ | ✅ |
| In sitemap.xml | ✅ | ✅ |
| Breadcrumb (visible + schema) | ✅ | ✅ |
| Product schema | ✅ | ✅ |
| Image alt text | ✅ | ✅ |
| Optimised images (next/image, WebP/AVIF, LCP priority) | ✅ | ✅ |
| Open Graph + Twitter card with price | ✅ | ✅ |
| Internal links in (home, footer, category, location, area, guide, related) | ✅ | ✅ |
| Related listings out | ✅ | ✅ |
| Location relevance (Ngong Road → Nairobi → Kenya) | ✅ | ✅ |
| Mobile sticky WhatsApp/call CTA | ✅ | ✅ |
| Analytics events | ✅ | ✅ |
| Google indexing readiness | ✅ (submit manually, section G) | ✅ |

---

## C. Technical SEO

| Area | State |
|---|---|
| Sitemap | `/sitemap.xml`, 1h revalidate. Home, services, marketplace, collection, every active listing, every stocked category, every stocked category+location, area pages, guide. Real `lastmod` on listings. No admin/checkout/auth/filter URLs. |
| robots.txt | Public site fully open; private, transactional and search-query URLs disallowed; sitemap + host declared. |
| Canonicals | Self-referencing everywhere. Listings and assets canonicalise to their own market host (derived from currency), not whichever host served the request. Filtered marketplace views canonicalise to `/marketplace`. |
| Indexation | No accidental `noindex` on any public page. `noindex, follow` used deliberately on: 404, filtered/search views, empty category/location pages, account pages. |
| Structured data | `Organization` + `WebSite`/`SearchAction` (root layout), `Product` (listings), `BreadcrumbList` (listings, categories, areas, guide), `ItemList` (marketplace, categories), `Article` (guide). No duplicate or conflicting blocks; no fabricated ratings. |
| Server-rendered HTML | Every listing title, price, location, description, breadcrumb and internal link is in the initial HTML. Nothing critical waits on client JS. |
| Internal links | See the table in section A. |
| Image SEO | `next/image` on all marketplace surfaces: intrinsic dimensions, responsive sizes, modern formats, lazy below the fold, descriptive alt derived from the actual object. |
| Core Web Vitals | Middleware no longer runs on public pages (TTFB); listing reads cached at the data layer; LCP image preloaded; images carry dimensions (CLS); no new client dependencies (INP). |
| 404 / redirects | Branded 404 with routes back into the marketplace. Apex-host 308 redirects from `www` and `*.workers.dev` were already in place and are unchanged. |
| Build | `npm run build`, `npx tsc --noEmit`, `npx eslint src` all clean — no new errors or warnings. |

---

## D. Local SEO

- Every listing's free-text location is resolved to a **real Kenyan place**
  (`Ngong Road, Nairobi`) and surfaced in the title, H1, description, breadcrumb,
  Product schema (`availableAtOrFrom` + `addressCountry: KE`) and card.
- Prices render and are marked up in **KES**.
- Location landing pages exist for the neighbourhoods that actually hold stock, and
  appear automatically as sellers post from new areas.
- The recognition table covers Nairobi neighbourhoods (Ngong Road, Karen, Runda,
  Muthaiga, Lavington, Kilimani, Kileleshwa, Westlands, Parklands, Gigiri, Langata,
  South B/C, Kasarani, Ruaka, Ongata Rongai, Syokimau …) plus Kiambu, Mombasa,
  Nakuru, Kisumu, Eldoret, Thika, Juja, Machakos, Nanyuki, Diani and more.
- The existing `/areas/*` service pages now also show marketplace stock in that
  area, tying the estate business and the marketplace together locally.
- `Organization` schema already declares a Nairobi address and Kenya as `areaServed`.

---

## E. Conversion: Google → listing → enquiry

1. A Nairobi buyer searches *"dining table and 6 chairs Nairobi"*.
2. The SERP shows a title naming the product, the intent and the place, a description
   with the price and a real detail, and a product image.
3. The page opens on mobile with the photo as a preloaded LCP image, the H1, the
   price in KES and the location immediately below it.
4. A **sticky bottom bar** follows the buyer through the whole page: item, price, and
   a green *WhatsApp* button. WhatsApp is the default in Kenya; the message is
   prefilled with the item name, price and URL so the seller knows what it's about.
   Call is one tap beside it.
5. Every tap fires a GA4 event, so enquiries are counted rather than guessed.
6. If they aren't ready, related listings and category links keep them on site.

Nothing fake was added — no urgency counters, no review counts, no verification badges.

---

## F. Seller traction — what future sellers get automatically

The moment any listing goes active it receives, with zero manual work: a unique
title/description/H1, Product + Breadcrumb schema, an optimised image with real alt
text, a self-referencing canonical, a sitemap entry with a true lastmod, a slot on
the homepage (if recent), footer-reachable category pages, a location landing page if
its area is recognised, related-listing links from every sibling, WhatsApp/call CTAs
with a prefilled message, and per-listing analytics.

Sellers see real views (now actually counting), status, category, location and listed
date in their dashboard.

---

## G. Manual actions — outside the codebase

**Do first**

1. **Run `supabase/seo-listing-copy.sql`** in the Supabase SQL editor. Highest-impact
   single action in this list (see the warning in section B).
2. **Run `supabase/listing-views.sql`** in the same editor. Creates the atomic
   view-increment function and stops a view bump from falsifying the sitemap's
   `<lastmod>`. Without it the view counter does not work at all. The script
   adds only — no statement in it removes a row, column, table or function.
   It ends with an optional, clearly-separated three-line permission block that
   locks the new function to the server; the site works with or without it.
   Note the SQL editor's "destructive operations" banner is keyword matching,
   not an assessment: `seo-listing-copy.sql` trips it on `UPDATE` (two rows, by
   design, with an undo in the file) and the optional block trips it on
   `REVOKE` (a permission, not data).
3. Deploy (`npm run deploy`).

**Google Search Console** — property `https://estateedit.org` (and `https://us.estateedit.org` separately)

4. Submit `https://estateedit.org/sitemap.xml`.
5. URL Inspection → *Request Indexing* for, in order:
   - `/marketplace/treated-cyprus-wood-msykim3y`
   - `/marketplace/treated-cyprus-wood-msyfd4pt`
   - `/marketplace/furniture`
   - `/marketplace/furniture/ngong-road`
   - `/marketplace/furniture/nairobi`
   - `/marketplace`
   - `/guides/buying-wooden-furniture-in-nairobi`
6. Validate both listings in the [Rich Results Test](https://search.google.com/test/rich-results)
   and the [Schema Markup Validator](https://validator.schema.org/).
7. Check Page Indexing → *Crawled – currently not indexed* after two weeks; that is
   the report that tells you whether the duplicate-title problem is resolved.

**IndexNow** (already built) — after the SQL run and deploy:

```bash
curl -X POST https://estateedit.org/api/indexnow -H "x-indexnow-secret: $INDEXNOW_SECRET"
```

**Google Analytics 4** (`G-T3WMR3MTQB`)

8. Admin → Events → mark `whatsapp_click`, `phone_click` and `enquiry_click` as
   **key events (conversions)**. The events fire already; GA just needs to be told
   they matter.
9. Optional: a "Marketplace" exploration on `listing_view` by `listing_title`, so the
   seller report is one click away.

**Google Business Profile** — do not create a second profile; edit the existing one

10. Primary category: *Estate liquidator*. Secondary: *Furniture store*, *Used furniture store*.
11. Description should mention both halves of the business — estate sales/liquidation
    **and** the marketplace — with the website URL.
12. Service areas: Nairobi and the neighbourhoods you actually serve.
13. Add photos of real stock; post the two furniture listings as GBP *Products* or
    *Offers* linking to their listing URLs.
14. Ask genuine past clients and sellers for reviews via the GBP short link. Never
    write or incentivise a review — a detected fake costs more than the reviews gain.

**Seller-side promotion** (free, and the fastest traffic)

15. Send Dominic the two listing URLs. The OG previews now render product image,
    title, price and location — they are built to be shared into WhatsApp groups and
    Facebook Marketplace/community pages.
16. Post both listings to the Estate Edit Instagram and LinkedIn with the listing URL.

**Content plan** — the guide page is the template. Next, in priority order:

17. *Dining Table and Chairs in Nairobi: Sizes, Woods and Prices* → links to furniture + Nairobi pages
18. *Buying Second-Hand and Estate Furniture in Kenya: A Buyer's Guide* → antiques + collection
19. *Furniture Buying Guide for Expats Moving to Nairobi* → ties to `/expat-services`
20. *What a 5/6, 4/6 and 6/6 Bed Actually Measures* → beds/furniture
21. One per month is plenty. Each must answer a real question and link to live
    listings; a page written only for keyword volume is worse than no page.

**Decision to make once something sells**

22. A sold or withdrawn listing currently 404s (onto the branded page, which links
    back into the marketplace). The alternative Google also accepts is to keep the
    URL live with `availability: SoldOut` and a "similar items" block — that
    preserves whatever ranking the URL earned and doubles as social proof for new
    sellers. It is a product decision (does a seller want their sold item still
    visible?), so it is deliberately left as-is rather than assumed. Say the word
    and it is a small change.

**Built since: the seller edit page**

The dashboard's *Edit* link pointed at `/sell/edit/[id]`, which did not exist and
404'd. It now does:

- Reuses the existing `ListingForm` in an edit mode rather than a second copy of
  the form, so create and edit cannot drift apart. Validation and the prohibited-
  content check are shared, which also closes a gap — content that passed the
  check when posted can no longer be edited in afterwards.
- **The slug is never regenerated, even when the title changes.** It is the
  permanent URL: it is in the sitemap, it is what Google indexed, and it is what
  the seller shared on WhatsApp. Renaming it on a title tweak would 404 all of
  that. The title tag, H1, meta description and Product schema all derive from
  the title anyway, so an edit still updates everything a searcher reads.
- A **rejected** listing goes back to `pending_review` on save — fixing a
  rejection is the main reason to edit, and it was the one case with no route
  back in. The dashboard now offers Edit for `draft`, `pending_review`, `active`
  and `rejected`; `sold` and `withdrawn` are declined by the action, not just
  hidden in the UI.
- Auth-gated in middleware and by the page itself (verified: an anonymous
  request 307s to `/auth/login?next=…`), scoped to `user_id` so another seller's
  id is "not found" rather than a page that confirms it exists, `noindex`, and
  disallowed in robots.txt.
- Listing writes now drop the marketplace cache (`revalidateTag("listings")` plus
  the affected paths). Previously an edit — or marking something sold — could sit
  stale on the marketplace and in the sitemap for up to a minute.
