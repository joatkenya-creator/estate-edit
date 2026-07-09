import Script from "next/script";

/**
 * Google Ads remarketing tag (AW-XXXXXXXXX) — lets you retarget site visitors
 * with Google/YouTube ads and track ad conversions. Set NEXT_PUBLIC_GOOGLE_ADS_ID
 * to enable; no-ops in dev or when unset.
 */
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GoogleAds() {
  if (process.env.NODE_ENV !== "production" || !ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ADS_ID}');`}
      </Script>
    </>
  );
}
