/**
 * Thin wrapper over the gtag.js queue already installed by
 * `components/seo/google-analytics.tsx` (GA4) and `google-ads.tsx`.
 *
 * No new dependency and no second analytics runtime: if gtag hasn't loaded
 * (dev, ad-blocker, script still deferred) the call is a no-op, so a tracking
 * call can never break a CTA. Events are named in GA4's snake_case convention
 * so they can be marked as conversions in the GA UI without extra config.
 */

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Params) => void;
  }
}

export type MarketplaceEvent =
  | "listing_view"
  | "enquiry_click"
  | "phone_click"
  | "whatsapp_click"
  | "seller_contact"
  | "listing_share"
  | "marketplace_search"
  | "category_view";

export function track(event: MarketplaceEvent, params?: Params): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
}
