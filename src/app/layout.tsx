import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
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
    default: "The Estate Edit: Luxury Estate & Transition Management",
    template: "%s · The Estate Edit",
  },
  description:
    "Nairobi's premier estate transition firm. White-glove luxury estate sales, commercial liquidation, and expat relocation services across East Africa.",
  keywords: [
    "luxury estate sales Nairobi",
    "estate liquidation Kenya",
    "commercial liquidation",
    "expat relocation Nairobi",
    "asset valuation Kenya",
  ],
  openGraph: {
    title: "The Estate Edit: Luxury Estate & Transition Management",
    description:
      "Luxury Estates. Commercial Liquidations. Seamless Transitions. White-glove estate management across East Africa.",
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
    title: "The Estate Edit: Luxury Estate & Transition Management",
    description:
      "Luxury Estates. Commercial Liquidations. Seamless Transitions. White-glove estate management across East Africa.",
    images: [OG_IMAGE],
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
        <JsonLd data={organizationJsonLd()} />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
