// Run: node --experimental-strip-types src/lib/residences.check.ts
//
// Guards the /residences filter, sort, pagination and URL rules, and the data
// validation that fails the build. A shared link like ?company=x&beds=4 must
// restore exactly the view it was copied from.
import assert from "node:assert/strict";
import { companyInitials, getCompanies, type Company } from "./companies.ts";
import {
  DEFAULT_QUERY,
  PAGE_SIZE,
  activeFilters,
  companyOptions,
  filterResidences,
  formatKes,
  formatPrice,
  listingTag,
  formatSpecs,
  mostRestrictiveFilter,
  parseResidenceQuery,
  queryResidences,
  residenceQueryString,
  residencesForCompany,
  sortResidences,
  getResidences,
  validateListings,
  type Residence,
  type ResidenceQuery,
} from "./residences.ts";

validateListings(getResidences(), getCompanies()); // live data is valid (also runs on import)
assert.equal(getResidences().filter((r) => r.featured).length, 1, "exactly one featured residence");
assert.equal(formatPrice({ priceKes: 100_000, status: "For rent" }), "KES 100,000 / month", "rent shows per month");
assert.equal(listingTag({ status: "For rent", furnished: true }), "For rent · Furnished");

// Fixtures: the retired sample listings, remapped onto the real companies.
const residences: Residence[] = [
  {
    slug: "acacia-house", name: "Acacia House", area: "Karen", propertyType: "House",
    bedrooms: 5, bathrooms: 6, sizeLabel: "1.5 acres", priceKes: 185_000_000, status: "For sale",
    listedBy: "luxury-creations", developer: "kings-developers", dateListed: "2026-08-02",
    description:
      "A single-storey stone house set back from the road behind mature acacias, with a covered veranda running the length of the garden side, a separate guest cottage and staff quarters.",
  },
  {
    slug: "ridgeway-residence", name: "The Ridgeway Residence", area: "Runda", propertyType: "House",
    bedrooms: 6, bathrooms: 7, sizeLabel: "1 acre", priceKes: 240_000_000, status: "For sale",
    listedBy: "luxury-creations", dateListed: "2026-06-18",
  },
  {
    slug: "muthaiga-garden-estate", name: "Muthaiga Garden Estate", area: "Muthaiga", propertyType: "House",
    bedrooms: 7, bathrooms: 8, sizeLabel: "2 acres", priceKes: 320_000_000, status: "For sale",
    listedBy: "luxury-creations", developer: "kings-developers", dateListed: "2026-07-21",
    description:
      "A two-storey family home on two landscaped acres, with formal reception rooms, a library, a heated pool and a walled kitchen garden.",
  },
  {
    slug: "jacaranda-townhouse", name: "Jacaranda Townhouse", area: "Lavington", propertyType: "Townhouse",
    bedrooms: 4, bathrooms: 5, sizeLabel: "gated community", priceKes: 95_000_000, status: "For sale",
    listedBy: "kings-developers", developer: "kings-developers", dateListed: "2026-09-05",
  },
  {
    slug: "argwings-penthouse", name: "Argwings Penthouse", area: "Kilimani", propertyType: "Penthouse",
    bedrooms: 4, bathrooms: 4, sizeLabel: "420 m²", priceKes: 68_000_000, status: "For sale",
    listedBy: "kings-developers", developer: "kings-developers", dateListed: "2026-08-27",
    description:
      "A full-floor penthouse with a wraparound terrace, private lift lobby and open views across the city towards the Ngong Hills.",
  },
  {
    slug: "riverside-sky-apartment", name: "Riverside Sky Apartment", area: "Westlands", propertyType: "Apartment",
    bedrooms: 3, bathrooms: 3, sizeLabel: "260 m²", priceKes: 42_000_000, status: "New listing",
    listedBy: "kings-developers", developer: "kings-developers", dateListed: "2026-10-12",
  },
  {
    slug: "ngong-view-villa", name: "Ngong View Villa", area: "Karen", propertyType: "Villa",
    bedrooms: 6, bathrooms: 7, sizeLabel: "2.5 acres", priceKes: 210_000_000, status: "New listing",
    listedBy: "luxury-creations", dateListed: "2026-10-03",
  },
  {
    slug: "runda-grove-house", name: "Runda Grove House", area: "Runda", propertyType: "House",
    bedrooms: 5, bathrooms: 6, sizeLabel: "0.75 acres", priceKes: 165_000_000, status: "For sale",
    listedBy: "kings-developers", dateListed: "2026-07-09",
  },
  {
    slug: "lavington-courtyard-home", name: "Lavington Courtyard Home", area: "Lavington", propertyType: "House",
    bedrooms: 5, bathrooms: 5, sizeLabel: "0.5 acres", priceKes: 120_000_000, status: "Under offer",
    listedBy: "luxury-creations", dateListed: "2026-05-30",
  },
];
const q = (over: Partial<ResidenceQuery>): ResidenceQuery => ({ ...DEFAULT_QUERY, ...over });

/* --- query parsing --------------------------------------------------------- */

assert.deepEqual(parseResidenceQuery({}), DEFAULT_QUERY, "defaults: nothing filtered, newest, page 1");
assert.deepEqual(
  parseResidenceQuery({ area: "KAREN", company: "kings-developers", type: "villa", beds: "4", price: "100-200m", status: "new-listing", sort: "price-asc", page: "3" }),
  q({ area: "Karen", company: "kings-developers", type: "Villa", beds: 4, price: "100-200m", status: "New listing", sort: "price-asc", page: 3 }),
);
assert.deepEqual(
  parseResidenceQuery({ area: "mombasa", company: "nobody", type: "castle", beds: "9", price: "free", status: "gone", sort: "sideways", page: "-2" }),
  DEFAULT_QUERY,
  "unknown values fall back",
);
assert.equal(parseResidenceQuery({ page: "1.5" }).page, 1, "page must be a whole number");
assert.equal(parseResidenceQuery({ sort: "low" }).sort, "price-asc", "legacy ?sort=low still works");
assert.equal(parseResidenceQuery({ sort: "high" }).sort, "price-desc", "legacy ?sort=high still works");
assert.equal(parseResidenceQuery({ area: ["runda", "karen"] }).area, "Runda", "repeated param: first wins");

/* --- query string round-trip ----------------------------------------------- */

assert.equal(residenceQueryString(DEFAULT_QUERY), "", "defaults are omitted from the URL");
assert.equal(residenceQueryString(q({ company: "luxury-creations", beds: 4 })), "?company=luxury-creations&beds=4");
assert.equal(residenceQueryString(q({ status: "Under offer" }), { tab: "listed" }), "?tab=listed&status=under-offer", "extra params kept");
for (const state of [
  q({ area: "Westlands", sort: "price-asc" }),
  q({ type: "Penthouse", price: "50-100m", page: 2 }),
  q({ status: "New listing", beds: 5, company: "kings-developers" }),
]) {
  const params = Object.fromEntries(new URLSearchParams(residenceQueryString(state)));
  assert.deepEqual(parseResidenceQuery(params), state, `round-trip ${JSON.stringify(state)}`);
}

/* --- filters ---------------------------------------------------------------- */

const slugs = (items: Residence[]) => items.map((r) => r.slug).sort();

assert.equal(filterResidences(residences, DEFAULT_QUERY).length, 9);
assert.deepEqual(slugs(filterResidences(residences, q({ area: "Karen" }))), ["acacia-house", "ngong-view-villa"]);
assert.ok(
  ["acacia-house", "muthaiga-garden-estate"].every((s) => slugs(filterResidences(residences, q({ company: "kings-developers" }))).includes(s)),
  "company filter matches the developer, not only the listing company",
);
assert.ok(filterResidences(residences, q({ beds: 5 })).every((r) => r.bedrooms >= 5), "beds is a minimum");
assert.deepEqual(slugs(filterResidences(residences, q({ price: "under-50m" }))), ["riverside-sky-apartment"]);
assert.ok(
  filterResidences(residences, q({ price: "100-200m" })).every((r) => r.priceKes >= 100_000_000 && r.priceKes < 200_000_000),
  "price bands are [min, max)",
);
assert.deepEqual(slugs(filterResidences(residences, q({ status: "Under offer" }))), ["lavington-courtyard-home"]);
assert.deepEqual(slugs(filterResidences(residences, q({ type: "Penthouse" }))), ["argwings-penthouse"]);
assert.deepEqual(
  slugs(filterResidences(residences, q({ company: "luxury-creations", beds: 4 }))).length,
  5,
  "the ?company=…&beds=4 example URL returns results",
);

/* --- sort ------------------------------------------------------------------- */

const newest = sortResidences(residences, "newest");
assert.equal(newest[0].slug, "riverside-sky-apartment", "newest first by dateListed");
assert.ok(newest.every((r, i) => i === 0 || newest[i - 1].dateListed >= r.dateListed));
const high = sortResidences(residences, "price-desc");
assert.equal(high[0].slug, "muthaiga-garden-estate");
assert.ok(high.every((r, i) => i === 0 || high[i - 1].priceKes >= r.priceKes));
assert.equal(sortResidences(residences, "price-asc")[0].slug, "riverside-sky-apartment");
assert.equal(residences[0].slug, "acacia-house", "sorting must not mutate the source list");
const tie = [{ ...residences[0], slug: "b" }, { ...residences[0], slug: "a" }];
assert.deepEqual(sortResidences(tie, "price-desc").map((r) => r.slug), ["a", "b"], "ties break on slug");

/* --- pagination ------------------------------------------------------------- */

const many: Residence[] = Array.from({ length: 30 }, (_, i) => ({
  ...residences[0],
  slug: `r-${String(i).padStart(2, "0")}`,
  dateListed: `2026-01-${String(i + 1).padStart(2, "0")}`,
}));
const p1 = queryResidences(many, q({ page: 1 }));
assert.equal(p1.total, 30);
assert.equal(p1.shown.length, PAGE_SIZE);
assert.equal(p1.hasMore, true);
assert.equal(p1.shown[0].slug, "r-29", "page 1 starts with the newest");
const p3 = queryResidences(many, q({ page: 3 }));
assert.equal(p3.shown.length, 30, "page N shows everything up to N × PAGE_SIZE");
assert.equal(p3.hasMore, false);
assert.equal(queryResidences(many, q({ page: 99 })).shown.length, 30, "an overshooting page is harmless");

/* --- chips, empty state, company options ------------------------------------ */

assert.deepEqual(activeFilters(q({ beds: 4, company: "luxury-creations", price: "200m-plus" })), [
  { key: "company", label: "Luxury Creations" },
  { key: "beds", label: "4+ beds" },
  { key: "price", label: "KES 200M+" },
]);
assert.equal(mostRestrictiveFilter(residences, DEFAULT_QUERY), null);
// Karen + Penthouse = 0. Dropping "Penthouse" brings back 2, dropping "Karen" brings back 1.
assert.equal(mostRestrictiveFilter(residences, q({ area: "Karen", type: "Penthouse" })), "type");
assert.deepEqual(
  companyOptions(residences, q({ area: "Kilimani" })).map((c) => c.slug),
  ["kings-developers"],
  "only companies with results are offered",
);
assert.deepEqual(
  companyOptions(residences, DEFAULT_QUERY).map((c) => c.name),
  ["Kings Developers", "Luxury Creations"],
  "A–Z",
);

/* --- company listings ------------------------------------------------------- */

const kings = residencesForCompany("kings-developers", residences);
assert.equal(kings.listed.length, 4);
assert.equal(kings.developed.length, 5);
assert.equal(kings.active, 6, "a residence it both lists and built counts once");
assert.equal(residencesForCompany("luxury-creations", residences).developed.length, 0, "agency-only develops nothing");

/* --- data rules ------------------------------------------------------------- */

const companies = getCompanies();
const roles = companies.map((c) => [...c.roles].sort().join("+")).sort();
assert.deepEqual(roles, ["agency", "developer"], "Kings (developer) and Luxury Creations (agency)");
assert.equal(residences.filter((r) => r.developer && r.developer !== r.listedBy).length, 2, "two residences built by someone else");
assert.ok(companies.every((c) => c.shortDescription.length <= 160));

/* --- validation ------------------------------------------------------------- */

assert.doesNotThrow(() => validateListings(residences, companies));
assert.throws(
  () => validateListings([{ ...residences[0], listedBy: "ghost-realty" }], companies),
  /Residence "acacia-house": listedBy "ghost-realty" is not a known company/,
);
assert.throws(
  () => validateListings([{ ...residences[0], developer: "ghost-builders" }], companies),
  /developer "ghost-builders" is not a known company/,
);
assert.throws(() => validateListings([residences[0], residences[0]], companies), /duplicate slug/);
assert.throws(
  () => validateListings([], [{ ...companies[0], shortDescription: "x".repeat(161) } as Company]),
  /over 160 characters/,
);

/* --- formatting ------------------------------------------------------------- */

assert.equal(formatKes(185_000_000), "KES 185,000,000");
assert.equal(formatSpecs({ bedrooms: 5, bathrooms: 6, sizeLabel: "1.5 acres" }), "5 bed · 6 bath · 1.5 acres");
assert.equal(companyInitials("Kings Developers"), "KD");
assert.equal(companyInitials("Luxury Creations"), "LC");

console.log("residences.check.ts: OK");
