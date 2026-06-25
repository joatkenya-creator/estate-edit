/**
 * Display-only currency localisation. Prices are stored and *processed* in KES;
 * we convert at display time to the visitor's local currency as a reference,
 * using live rates (base KES). The visitor's country comes from Cloudflare's
 * /cdn-cgi/trace (handled in the provider).
 */

/** Live KES exchange rates — free, no API key required. base_code = "KES". */
export const KES_RATES_URL = "https://open.er-api.com/v6/latest/KES";

/** ISO-3166 alpha-2 country -> ISO-4217 currency for the markets we care about. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  KE: "KES",
  // North America
  US: "USD", CA: "CAD", MX: "MXN",
  // Eurozone
  AT: "EUR", BE: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR", DE: "EUR",
  GR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR",
  NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR", HR: "EUR",
  // Rest of Europe
  GB: "GBP", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK",
  HU: "HUF", RO: "RON", BG: "BGN", RU: "RUB", UA: "UAH", TR: "TRY", IS: "ISK",
  // Middle East
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR", IL: "ILS",
  JO: "JOD", LB: "LBP",
  // Africa
  TZ: "TZS", UG: "UGX", RW: "RWF", BI: "BIF", ET: "ETB", SS: "SSP", SO: "SOS",
  NG: "NGN", GH: "GHS", ZA: "ZAR", EG: "EGP", MA: "MAD", DZ: "DZD", TN: "TND",
  ZM: "ZMW", ZW: "ZWL", BW: "BWP", MU: "MUR", NA: "NAD", AO: "AOA", MZ: "MZN",
  CD: "CDF", CM: "XAF", CI: "XOF", SN: "XOF",
  // Asia
  IN: "INR", CN: "CNY", JP: "JPY", KR: "KRW", SG: "SGD", HK: "HKD", TW: "TWD",
  MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT",
  LK: "LKR", NP: "NPR",
  // Oceania
  AU: "AUD", NZ: "NZD",
  // South America
  BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",
};

/**
 * Currency to display for a visitor's country. Kenya / unknown -> KES (no
 * conversion). Known-but-unmapped countries fall back to USD as an
 * international reference (USD is always present in the rates feed).
 */
export function currencyForCountry(country?: string | null): string {
  if (!country) return "KES";
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? "USD";
}
