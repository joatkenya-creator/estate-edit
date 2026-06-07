import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
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
  metadataBase: new URL("https://theestateedit.co.ke"),
  title: {
    default: "The Estate Edit — Luxury Estate & Transition Management",
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
    title: "The Estate Edit — Luxury Estate & Transition Management",
    description:
      "Luxury Estates. Commercial Liquidations. Seamless Transitions. White-glove estate management across East Africa.",
    type: "website",
    locale: "en_KE",
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
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
