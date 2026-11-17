// Run: node --experimental-strip-types src/lib/developments.check.ts
//
// Guards the Kings Lotus facts against the brochure (brief 2.3) and the rules
// that keep unconfirmed data off published pages.
import assert from "node:assert/strict";
import {
  developmentEnquireHref,
  formatPrice,
  formatSize,
  getAllDevelopments,
  getDevelopment,
  getDevelopments,
  getUnitType,
  minSizeSqft,
  validateDevelopments,
  whatsappText,
} from "./developments.ts";

const lotus = getDevelopment("kings-lotus")!;
assert.ok(lotus, "Lotus is published");
assert.deepEqual(getDevelopments().map((d) => d.slug), ["kings-lotus"], "Apollo and Ngong stay drafts");
assert.equal(getDevelopment("kings-apollo"), undefined, "drafts are not reachable by slug");

// Brochure: 84 + 84 + 112 + 28 = 308.
assert.deepEqual(
  lotus.unitTypes.map((u) => [u.slug, u.sizeSqft, u.unitCount]),
  [
    ["2-bedroom-standard", 665, 84],
    ["2-bedroom-master-ensuite", 740, 84],
    ["3-bedroom-master-ensuite", 950, 112],
    ["4-bedroom-maisonette", 1580, 28],
  ],
);
assert.equal(lotus.totalUnits, 308);
assert.equal(lotus.amenities.length, 15, "brochure lists 15 amenities");
assert.equal(minSizeSqft(lotus), 665);

// Nothing invented: unknowns stay null.
assert.equal(lotus.priceFromKes, null);
assert.equal(lotus.completionEstimate, null);
assert.ok(lotus.unitTypes.every((u) => u.priceFromKes === null && u.unitsAvailable === null));

// Formatting.
assert.equal(formatSize(665), "665 sq ft (62 m²)");
assert.equal(formatSize(1580), "1,580 sq ft (147 m²)");
assert.equal(formatPrice(null), "Price on request");
assert.equal(formatPrice(6_500_000), "KES 6,500,000");
const three = getUnitType(lotus, "3-bedroom-master-ensuite")!;
assert.equal(
  whatsappText(lotus, three),
  "Hi, I'm interested in Kings Lotus – 3 Bedroom Master Ensuite (950 sq ft). Please share prices and the payment plan.",
);
assert.equal(
  developmentEnquireHref(lotus, three, "viewing"),
  "/contact?development=kings-lotus&unit=3-bedroom-master-ensuite&enquiry=viewing",
);

// Validation.
const companies = ["kings-developers"];
assert.doesNotThrow(() => validateDevelopments(getAllDevelopments(), companies));
assert.throws(() => validateDevelopments([{ ...lotus, totalUnits: 300 }], companies), /add up to 308/);
assert.throws(() => validateDevelopments([{ ...lotus, tagline: "[KINGS TO CONFIRM]" }], companies), /placeholder/);
assert.throws(() => validateDevelopments([lotus, lotus], companies), /duplicate slug/);
assert.throws(() => validateDevelopments([{ ...lotus, developer: "ghost" }], companies), /unknown developer/);

console.log("developments.check.ts: OK");
