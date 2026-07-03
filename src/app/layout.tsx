import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { RegionProvider } from "@/components/region/region-context";
import { JsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
import { Clarity } from "@/components/seo/clarity";
import { OG_IMAGE, SITE_URL, organizationJsonLd } from "@/lib/seo";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://estateedit.org"),
  title: {
    default: "Luxury Estate Sales & Liquidation in Nairobi, Kenya | The Estate Edit",
    template: "%s · The Estate Edit",
  },
  description:
    "Luxury estate sales, commercial liquidation, and expat relocation in Nairobi, Kenya. Discreet valuation, marketing, and sale of homes and fine art.",
  keywords: [
    "estate sales Nairobi",
    "luxury estate sales Kenya",
    "estate liquidation Nairobi",
    "commercial liquidation Kenya",
    "business asset liquidation Nairobi",
    "expat relocation Nairobi",
    "downsizing services Nairobi",
    "fleet liquidation Kenya",
    "asset valuation Kenya",
    "estate sale company Nairobi",
  ],
  openGraph: {
    title: "Luxury Estate Sales & Liquidation in Nairobi, Kenya | The Estate Edit",
    description:
      "Luxury estates, commercial liquidations, and seamless transitions in Nairobi, Kenya. White-glove valuation, marketing, and sale of high-value assets.",
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: "The Estate Edit",
    images: [
      { url: OG_IMAGE, width: 1200, height: 630, alt: "The Estate Edit" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Estate Sales & Liquidation in Nairobi, Kenya | The Estate Edit",
    description:
      "Luxury estates, commercial liquidations, and seamless transitions in Nairobi, Kenya. White-glove valuation, marketing, and sale of high-value assets.",
    images: [OG_IMAGE],
  },
  // Search engine ownership verification (renders <meta name=...> in <head>).
  verification: {
    other: {
      "msvalidate.01": "22FD0F6E044C99B01F2A9FD628E4DF8C", // Bing Webmaster Tools
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GoogleAnalytics />
        <Clarity />
        <JsonLd data={organizationJsonLd()} />
        <RegionProvider>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </RegionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
