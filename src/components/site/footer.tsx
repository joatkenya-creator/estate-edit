"use client";

import Link from "next/link";
import Image from "next/image";
import { Camera, Globe } from "lucide-react";
import { siteConfig, regionContent } from "@/lib/site";
import { useRegion } from "@/components/region/region-context";

const SERVICES = {
  title: "Services",
  links: [
    { label: "Estate Sales", href: "/estate-sales" },
    { label: "Commercial Liquidation", href: "/commercial-liquidation" },
    { label: "Concierge Transition", href: "/concierge" },
    { label: "Expat Services", href: "/expat-services" },
    { label: "The Collection", href: "/collection" },
    { label: "Sell With Us", href: "/sell-with-us" },
  ],
};

const COMPANY = {
  title: "Company",
  links: [
    { label: "About Us", href: "/about" },
    { label: "Our Process", href: "/#process" },
    { label: "Delivery & Returns", href: "/delivery" },
    { label: "Contact", href: "/contact" },
  ],
};

export function SiteFooter() {
  const { region } = useRegion();
  const content = regionContent[region];

  // "Areas Served" is region-localised (Kenya neighbourhoods vs affluent Virginia areas).
  const columns = [
    SERVICES,
    {
      title: "Areas Served",
      links: content.areasServed.map((area) => ({ label: area, href: "/contact" })),
    },
    COMPANY,
  ];

  return (
    <footer className="gradient-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            {/* Full logo lockup, rendered for the dark footer: gold monogram +
                white wordmark + the brand tagline. */}
            <Image
              src="/logo-mark.svg"
              alt="The Estate Edit"
              width={72}
              height={62}
              unoptimized
              className="h-14 w-auto"
            />
            <div className="mt-4 font-display text-2xl uppercase tracking-[0.16em] text-white">
              The Estate Edit
            </div>
            <div className="mt-3 h-px w-60 max-w-full bg-white/20" />
            <p className="mt-3 text-[0.58rem] uppercase tracking-[0.24em] text-gold-soft">
              Estate Transition · Asset Liquidation · Property Management
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/65">
              {content.description}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={siteConfig.social.instagram}
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
              >
                <Camera className="size-4.5" strokeWidth={1.6} />
              </a>
              <a
                href={siteConfig.social.linkedin}
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
              >
                <Globe className="size-4.5" strokeWidth={1.6} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} The Estate Edit. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </nav>
          <p className="flex items-center gap-2">
            {region !== "virginia" && (
              <>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {siteConfig.phone}
                </a>
                <span className="text-white/25">·</span>
              </>
            )}
            <a
              href={`mailto:${siteConfig.email}`}
              className="transition-colors hover:text-white"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
