import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js). Loaded with the `afterInteractive` strategy —
 * Next's recommended strategy for analytics/tag managers — so it never blocks
 * first paint. Only injected in production so local `next dev` traffic doesn't
 * pollute the analytics property.
 */
const GA_MEASUREMENT_ID = "G-1MHV08SHR6";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
