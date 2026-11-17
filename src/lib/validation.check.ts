// Run: node --experimental-strip-types src/lib/validation.check.ts
//
// Phone normalisation and the search typo-fixer are the two bits of logic
// here that would fail quietly (a real buyer told their number is wrong, or a
// "no results" page that should have found something).
import assert from "node:assert/strict";
import { normalizePhone, validateBuyerEnquiry, validateInquiry, validateListing } from "./validation.ts";
import { alternativeQueries, levenshtein } from "./fuzzy-search.ts";

assert.equal(normalizePhone("0712 345 678"), "+254712345678");
assert.equal(normalizePhone("0112-345-678"), "+254112345678");
assert.equal(normalizePhone("254712345678"), "+254712345678");
assert.equal(normalizePhone("+254 712 345 678"), "+254712345678");
assert.equal(normalizePhone("+1 703 555 0100"), "+17035550100");
assert.equal(normalizePhone("+25471234567"), null, "short Kenyan number");
assert.equal(normalizePhone("12345"), null);

const ok = {
  full_name: "Jane Mwangi", email: "jane@email.com", phone: "+254712345678",
  client_segment: "individual", service_division: "estate_sales",
  message: "Moving to London in March.", consent: "on",
};
assert.deepEqual(validateInquiry(ok), {});
assert.ok(validateInquiry({ ...ok, consent: undefined }).consent);
assert.ok(validateInquiry({ ...ok, email: "jane@" }).email);

const listing = { title: "Mahogany dining table", category: "furniture", price: "25000", location: "Karen" };
assert.deepEqual(validateListing(listing, 1, "KES"), {});
assert.ok(validateListing({ ...listing, price: "25,000" }, 1, "KES").price);
assert.ok(validateListing({ ...listing, price: "99.50" }, 1, "KES").price, "KES is whole shillings");
assert.deepEqual(validateListing({ ...listing, price: "99.50" }, 1, "USD"), {});
assert.ok(validateListing(listing, 0, "KES").photos);

assert.equal(levenshtein("mahagony", "mahogany"), 2);
const vocab = ["Victorian mahogany dining table", "Samsung television 55 inch", "Furniture"];
assert.deepEqual(alternativeQueries("mahagony", vocab), ["mahogany"]);
assert.ok(alternativeQueries("couch", vocab).includes("sofa"));
assert.ok(alternativeQueries("tv", vocab).includes("television"));
assert.deepEqual(alternativeQueries("table", vocab), [], "a correct word needs no fix");
assert.deepEqual(alternativeQueries("xqzv", vocab), [], "nonsense gets no suggestion");

// Buyer enquiry (developments): diaspora numbers pass, unknown options and dates fail.
const buyer = {
  full_name: "Jane Wanjiru", email: "jane@example.com", phone: "+44 7700 900123",
  buyer_type: "diaspora", enquiry_type: "viewing", preferred_contact: "whatsapp", consent: "on",
};
assert.deepEqual(validateBuyerEnquiry(buyer), {}, "a complete diaspora enquiry is valid");
assert.deepEqual(validateBuyerEnquiry({ ...buyer, preferred_date: "2026-12-01" }), {});
assert.ok(validateBuyerEnquiry({ ...buyer, buyer_type: "landlord" }).buyer_type, "unknown buyer type");
assert.ok(validateBuyerEnquiry({ ...buyer, enquiry_type: "deposit" }).enquiry_type, "no online deposits");
assert.ok(validateBuyerEnquiry({ ...buyer, preferred_date: "next week" }).preferred_date);
assert.ok(validateBuyerEnquiry({ ...buyer, consent: undefined }).consent);

console.log("validation.check: ok");
