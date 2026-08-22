-- =============================================================================
-- Tidy the seller-entered copy on Dominic Ongeri's two listings.
--
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run: the second run matches nothing and changes nothing.
--
-- READ THIS BEFORE RUNNING
--
-- This script CHANGES DATA — that is its whole purpose, and it cannot be
-- written any other way. It edits the `title` and `description` of exactly two
-- listings. It does not remove any row, column, table or function, and it
-- cannot touch any listing other than the two named below.
--
-- Three things make it safe:
--   * each statement is matched on a unique `slug`, so at most one row each;
--   * each statement ALSO requires the current title to still be the old one,
--     so it cannot overwrite an edit you or the seller made in the meantime;
--   * step 1 below shows you the exact current values first, and the undo at
--     the bottom puts them back.
--
-- WHY IT IS NEEDED
--
-- Both rows are titled exactly "Treated Cyprus wood". Two live pages with an
-- identical title compete with each other for the same search, and Google
-- keeps one and drops the other as a duplicate. The site now adds the location
-- and the buyer-intent phrase automatically ("… for Sale in Ngong Road,
-- Nairobi") — but no amount of code can invent the words that tell a searcher
-- which listing is the bed and which is the dining set. Only the seller's own
-- description holds that, and this moves it into the field search engines read.
--
-- NOTHING HERE IS INVENTED. Every fact below is already in the seller's own
-- description:
--   "Size 200cm by 152cm) a 5/6 bed"
--   "Table size(hight 80cm) leght 180cm) dept 100cm) with 6 dining chairs)
--    finishing natural clear fanish"
-- No price, condition, location, photo or availability is touched.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- STEP 1 — see exactly what is there now, and copy the result somewhere.
--          This is your undo material. Run it on its own first.
-- -----------------------------------------------------------------------------
select slug, title, description, price, currency, location, status
  from public.user_listings
 where slug in ('treated-cyprus-wood-msykim3y', 'treated-cyprus-wood-msyfd4pt');


-- -----------------------------------------------------------------------------
-- STEP 2 — the bed (KES 30,000)
-- -----------------------------------------------------------------------------
update public.user_listings
   set title       = 'Treated Cyprus Wood 5/6 Bed',
       description = 'Treated cyprus wood 5/6 bed. Size: 200cm by 152cm.'
 where slug  = 'treated-cyprus-wood-msykim3y'
   and title = 'Treated Cyprus wood';


-- -----------------------------------------------------------------------------
-- STEP 3 — the dining set (KES 58,000)
-- -----------------------------------------------------------------------------
update public.user_listings
   set title       = 'Treated Cyprus Wood Dining Table & 6 Chairs',
       description = 'Treated cyprus wood dining table with 6 dining chairs. '
                     'Table size: 180cm long x 100cm deep x 80cm high. '
                     'Natural clear finish.'
 where slug  = 'treated-cyprus-wood-msyfd4pt'
   and title = 'Treated Cyprus wood';


-- -----------------------------------------------------------------------------
-- STEP 4 — confirm. Both rows should show the new titles; price, currency,
--          location and status should be unchanged from step 1.
-- -----------------------------------------------------------------------------
select slug, title, description, price, currency, location, status
  from public.user_listings
 where slug in ('treated-cyprus-wood-msykim3y', 'treated-cyprus-wood-msyfd4pt');


-- =============================================================================
-- UNDO — puts the original wording back, exactly as step 1 showed it.
--
--   update public.user_listings
--      set title = 'Treated Cyprus wood',
--          description = 'Size 200cm by 152cm) a 5/6 bed'
--    where slug = 'treated-cyprus-wood-msykim3y';
--
--   update public.user_listings
--      set title = 'Treated Cyprus wood',
--          description = 'Table size(hight 80cm) leght 180cm) dept 100cm) with 6 dining chairs) finishing natural clear fanish'
--    where slug = 'treated-cyprus-wood-msyfd4pt';
--
-- =============================================================================
-- AFTERWARDS
--
-- The listing pages pick the new copy up within 60 seconds. The title tags
-- become:
--
--   Treated Cyprus Wood 5/6 Bed for Sale in Ngong Road, Nairobi
--   Treated Cyprus Wood Dining Table & 6 Chairs for Sale in Nairobi
--
-- Then request indexing for both URLs in Google Search Console (URL Inspection
-- → Request Indexing) so the new titles get recrawled rather than waited for.
-- =============================================================================
