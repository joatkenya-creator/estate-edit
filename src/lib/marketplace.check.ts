// Run: node --experimental-strip-types src/lib/marketplace.check.ts
//
// Guards the derivation rules that every listing page, category page, sitemap
// entry and OG tag depends on. If one of these breaks, the damage is silent —
// wrong titles ship and Google indexes them — so it is worth the twenty lines.
import assert from "node:assert/strict";
import {
  categoryBySlug,
  cityOf,
  placeMatches,
  listingImageAlt,
  listingMetaDescription,
  listingSeoTitle,
  placeBySlug,
  resolvePlace,
} from "./marketplace.ts";

/* --- place recognition ---------------------------------------------------- */

const ngong = resolvePlace("Ngong road opposite Raila odinga stadium");
assert.equal(ngong?.area, "Ngong Road", "a road inside a longer address must be recognised");
assert.equal(ngong?.city, "Nairobi");
assert.equal(ngong?.slug, "ngong-road");
assert.equal(ngong?.label, "Ngong Road, Nairobi");

// "Ngong Road" must beat the shorter "Ngong" (a different town in Kajiado).
assert.equal(resolvePlace("Ngong town")?.city, "Kajiado");

// A city names itself; no ", City" suffix duplication.
assert.equal(resolvePlace("Mombasa")?.label, "Mombasa");

// Unrecognised locations keep the seller's words and get NO landing page.
const unknown = resolvePlace("behind the big mango tree");
assert.equal(unknown?.slug, "", "an unrecognised place must not claim a browsable slug");
assert.equal(resolvePlace(""), null);
assert.equal(resolvePlace(null), null);

// Round-trips with the URL segment used by /marketplace/<category>/<area>.
assert.equal(placeBySlug("ngong-road")?.label, "Ngong Road, Nairobi");
assert.equal(placeBySlug("not-a-place"), null);

/* --- city rollup ------------------------------------------------------------
 *
 * The bug this guards: sellers type a street, never a city, so matching a
 * location page by exact slug left /marketplace/furniture/nairobi permanently
 * empty (and therefore noindexed) while /furniture/ngong-road had everything.
 * A city page must contain its neighbourhoods.
 */

const nairobi = placeBySlug("nairobi")!;
const karen = placeBySlug("karen")!;
const kiambu = placeBySlug("kiambu")!;
const ngongRoad = placeBySlug("ngong-road")!;
const sellerText = "Ngong road opposite Raila odinga stadium";

assert.ok(placeMatches(sellerText, nairobi), "a Ngong Road listing IS a Nairobi listing");
assert.ok(placeMatches(sellerText, ngongRoad), "and still its own neighbourhood");
assert.ok(!placeMatches(sellerText, karen), "but not a different Nairobi neighbourhood");
assert.ok(!placeMatches(sellerText, kiambu), "and not a different county");
assert.ok(placeMatches("Juja", kiambu), "Juja rolls up into Kiambu");
assert.ok(!placeMatches("Juja", nairobi), "Juja is not Nairobi");
assert.ok(!placeMatches("behind the big mango tree", nairobi), "an unknown place matches nothing");

assert.equal(cityOf(ngongRoad)?.slug, "nairobi");
assert.equal(cityOf(nairobi), null, "a city has no parent city to roll up into");
assert.equal(cityOf(placeBySlug("diani")!)?.slug, "kwale", "every county used as a city has a page");

/* --- category routing ----------------------------------------------------- */

assert.equal(categoryBySlug("furniture")?.value, "furniture");
assert.equal(categoryBySlug("fine-art")?.value, "fine_art", "URL uses a hyphen, the enum an underscore");
// A listing slug must never be mistaken for a category (they carry a base-36 suffix).
assert.equal(categoryBySlug("treated-cyprus-wood-msykim3y"), null);

/* --- listing copy --------------------------------------------------------- */

const bed = {
  slug: "treated-cyprus-wood-msykim3y",
  title: "Treated Cyprus Wood 5/6 Bed",
  description: "Size 200cm by 152cm) a 5/6 bed",
  price: 30000,
  currency: "KES",
  category: "furniture",
  condition: "new",
  location: "Ngong road opposite Raila odinga stadium",
};

assert.equal(listingSeoTitle(bed), "Treated Cyprus Wood 5/6 Bed for Sale in Ngong Road, Nairobi");

// Long titles degrade to the city rather than being truncated mid-word.
const longTitle = listingSeoTitle({
  ...bed,
  title: "Treated Cyprus Wood Dining Table with Six Matching Dining Chairs",
});
assert.ok(longTitle.includes("Nairobi"), "the place survives the degrade");
assert.ok(!longTitle.includes("Ngong Road"), "the neighbourhood is dropped before the city");

// Nothing is said twice when the seller already wrote it.
assert.equal(
  listingSeoTitle({ ...bed, title: "Wooden Bed for Sale in Nairobi" }),
  "Wooden Bed for Sale in Nairobi",
);

// Unique, factual meta description: place, price, and the seller's own detail,
// inside a length Google will actually render.
const meta = listingMetaDescription(bed);
assert.ok(meta.includes("Ngong Road, Nairobi"));
assert.ok(meta.includes("KES 30,000"), "price is rendered in the listing's own currency");
assert.ok(meta.includes("Size 200cm by 152cm"), "a real detail from the seller, not a template");
assert.ok(meta.length <= 158, `meta description must fit the SERP, got ${meta.length}`);

// Mangled seller copy ("size(hight 80cm) leght 180cm) with 6 dining chairs)")
// must not leak a broken fragment into the SERP.
const mangled = listingMetaDescription({
  ...bed,
  title: "Treated Cyprus Wood Dining Table & 6 Chairs",
  description: "Table size(hight 80cm) leght 180cm) dept 100cm) with 6 dining chairs) finishing natural clear fanish",
});
assert.ok(!mangled.includes("("), "an unclosed bracket must never reach the description");
assert.ok(mangled.length <= 158);

// A description that only restates the title adds nothing — skip it rather
// than say the same thing twice in 160 characters.
assert.ok(
  !listingMetaDescription({ ...bed, description: "Treated cyprus wood 5/6 bed." }).includes(
    "bed. Treated",
  ),
  "a title-echoing clause should be dropped",
);

// Two listings that differ only in description must not share a description.
assert.notEqual(
  meta,
  listingMetaDescription({ ...bed, description: "Dining table with 6 chairs", price: 58000 }),
);

// Alt text describes the object, not a keyword list.
assert.equal(
  listingImageAlt(bed),
  "Treated Cyprus Wood 5/6 Bed (new) for sale in Ngong Road, Nairobi",
);

// A listing with no location still produces sane copy (falls back to country).
const noLocation = { ...bed, location: null };
assert.ok(listingSeoTitle(noLocation).endsWith("in Kenya"));
assert.ok(!listingImageAlt(noLocation).includes("for sale in"));

console.log("marketplace.check.ts: OK");
