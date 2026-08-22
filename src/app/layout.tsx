import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { RegionProvider } from "@/components/region/region-context";
import { RegionBanner } from "@/components/region/region-banner";
import { JsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
import { Clarity } from "@/components/seo/clarity";
import { MetaPixel } from "@/components/seo/meta-pixel";
import { GoogleAds } from "@/components/seo/google-ads";
import { UtmTracker } from "@/components/marketing/utm-tracker";
import { OG_IMAGE, buildOpenGraph, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getRegion } from "@/lib/region.server";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * Region-aware fallback metadata for pages that don't set their own
 * title/description/openGraph (e.g. the homepage only overrides `alternates`).
 * Without this branch, a Virginia visitor would silently inherit
 * Nairobi-branded title/OG/Twitter tags on every under-specified page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegion();
  const isVa = region === "virginia";

  const title = isVa
    ? "Estate Sales & Liquidation, Virginia | The Estate Edit"
    : "Estate Sales & Liquidation, Nairobi | The Estate Edit";
  const description = isVa
    ? "Luxury estate sales, commercial liquidation, and concierge transitions serving Virginia. Discreet valuation, marketing, and sale of homes and fine art."
    : "Luxury estate sales, commercial liquidation, and expatriate relocation in Nairobi, Kenya. Discreet valuation, marketing, and sale of homes and fine art.";
  const keywords = isVa
    ? [
        "estate sales Virginia",
        "luxury estate sales Virginia",
        "estate liquidation Virginia",
        "commercial liquidation Virginia",
        "business asset liquidation Virginia",
        "downsizing services Virginia",
        "asset valuation Virginia",
        "estate sale company Virginia",
        "estate sales Northern Virginia",
      ]
    : [
        "estate sales Nairobi",
        "luxury estate sales Kenya",
        "estate liquidation Nairobi",
        "commercial liquidation Kenya",
        "business asset liquidation Nairobi",
        "expatriate relocation Nairobi",
        "downsizing services Nairobi",
        "fleet liquidation Kenya",
        "asset valuation Kenya",
        "estate sale company Nairobi",
      ];

  const openGraph = buildOpenGraph({ title, description, path: "/", region });

  return {
    metadataBase: new URL("https://estateedit.org"),
    title: {
      default: title,
      template: "%s · The Estate Edit",
    },
    description,
    keywords,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
    // Search engine ownership verification (renders <meta name=...> in <head>).
    verification: {
      other: {
        "msvalidate.01": "22FD0F6E044C99B01F2A9FD628E4DF8C", // Bing Webmaster Tools
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Request-memoized by Next (same headers() call generateMetadata already
  // makes for this request) — free to call again here.
  const region = await getRegion();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GoogleAnalytics />
        <Clarity />
        <MetaPixel />
        <GoogleAds />
        <UtmTracker />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <RegionProvider initialRegion={region}>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CartDrawer />
            <RegionBanner />
          </CartProvider>
        </RegionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
