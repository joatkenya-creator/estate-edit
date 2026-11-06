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
  formatSpecs,
  getResidences,
  mostRestrictiveFilter,
  parseResidenceQuery,
  queryResidences,
  residenceQueryString,
  residencesForCompany,
  sortResidences,
  validateListings,
  type Residence,
  type ResidenceQuery,
} from "./residences.ts";

const residences = getResidences();
const q = (over: Partial<ResidenceQuery>): ResidenceQuery => ({ ...DEFAULT_QUERY, ...over });

/* --- query parsing --------------------------------------------------------- */

assert.deepEqual(parseResidenceQuery({}), DEFAULT_QUERY, "defaults: nothing filtered, newest, page 1");
assert.deepEqual(
  parseResidenceQuery({ area: "KAREN", company: "savanna-crest-homes", type: "villa", beds: "4", price: "100-200m", status: "new-listing", sort: "price-asc", page: "3" }),
  q({ area: "Karen", company: "savanna-crest-homes", type: "Villa", beds: 4, price: "100-200m", status: "New listing", sort: "price-asc", page: 3 }),
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
assert.equal(residenceQueryString(q({ company: "mvule-and-hart-realty", beds: 4 })), "?company=mvule-and-hart-realty&beds=4");
assert.equal(residenceQueryString(q({ status: "Under offer" }), { tab: "listed" }), "?tab=listed&status=under-offer", "extra params kept");
for (const state of [
  q({ area: "Westlands", sort: "price-asc" }),
  q({ type: "Penthouse", price: "50-100m", page: 2 }),
  q({ status: "New listing", beds: 5, company: "kijani-ridge-developments" }),
]) {
  const params = Object.fromEntries(new URLSearchParams(residenceQueryString(state)));
  assert.deepEqual(parseResidenceQuery(params), state, `round-trip ${JSON.stringify(state)}`);
}

/* --- filters ---------------------------------------------------------------- */

const slugs = (items: Residence[]) => items.map((r) => r.slug).sort();

assert.equal(filterResidences(residences, DEFAULT_QUERY).length, 9);
assert.deepEqual(slugs(filterResidences(residences, q({ area: "Karen" }))), ["acacia-house", "ngong-view-villa"]);
assert.deepEqual(
  slugs(filterResidences(residences, q({ company: "kijani-ridge-developments" }))),
  ["acacia-house", "muthaiga-garden-estate"],
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
  slugs(filterResidences(residences, q({ company: "mvule-and-hart-realty", beds: 4 }))).length,
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

assert.deepEqual(activeFilters(q({ beds: 4, company: "mvule-and-hart-realty", price: "200m-plus" })), [
  { key: "company", label: "Mvule & Hart Realty" },
  { key: "beds", label: "4+ beds" },
  { key: "price", label: "KES 200M+" },
]);
assert.equal(mostRestrictiveFilter(residences, DEFAULT_QUERY), null);
// Karen + Penthouse = 0. Dropping "Penthouse" brings back 2, dropping "Karen" brings back 1.
assert.equal(mostRestrictiveFilter(residences, q({ area: "Karen", type: "Penthouse" })), "type");
assert.deepEqual(
  companyOptions(residences, q({ area: "Kilimani" })).map((c) => c.slug),
  ["savanna-crest-homes"],
  "only companies with results are offered",
);
assert.deepEqual(
  companyOptions(residences, DEFAULT_QUERY).map((c) => c.name),
  ["Kijani Ridge Developments", "Mvule & Hart Realty", "Savanna Crest Homes"],
  "A–Z",
);

/* --- company listings ------------------------------------------------------- */

const savanna = residencesForCompany("savanna-crest-homes");
assert.equal(savanna.listed.length, 4);
assert.equal(savanna.developed.length, 3);
assert.equal(savanna.active, 4, "a residence it both lists and built counts once");
assert.equal(residencesForCompany("kijani-ridge-developments").listed.length, 0, "developer-only lists nothing");

/* --- sample data rules ------------------------------------------------------ */

const companies = getCompanies();
const roles = companies.map((c) => [...c.roles].sort().join("+")).sort();
assert.deepEqual(roles, ["agency", "agency", "developer", "agency+developer"].sort(), "one developer, two agencies, one both");
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
assert.equal(companyInitials("Mvule & Hart Realty"), "MH");
assert.equal(companyInitials("Savanna Crest Homes"), "SC");

console.log("residences.check.ts: OK");
