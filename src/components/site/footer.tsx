"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig, regionContent, RESIDENCES_LIVE, DEVELOPMENTS_LIVE } from "@/lib/site";
import { areaSlug } from "@/lib/region";
import { useRegion } from "@/components/region/region-context";

const SERVICES = {
  title: "Services",
  links: [
    { label: "Estate Sales", href: "/estate-sales" },
    { label: "Commercial Liquidation", href: "/commercial-liquidation" },
    { label: "Concierge Transition", href: "/concierge" },
    { label: "Expatriate Services", href: "/expat-services" },
    { label: "The Collection", href: "/collection" },
    { label: "Sell With Us", href: "/sell-with-us" },
  ],
};

/**
 * The Marketplace had no footer presence at all, so every listing depended on
 * the header nav for internal links. These are sitewide links straight into
 * the category landing pages that listings live under.
 */
const MARKETPLACE = {
  title: "Marketplace",
  links: [
    { label: "All Listings", href: "/marketplace" },
    { label: "Furniture for Sale", href: "/marketplace/furniture" },
    { label: "Fine Art for Sale", href: "/marketplace/fine-art" },
    { label: "Jewellery for Sale", href: "/marketplace/jewellery" },
    { label: "Vehicles for Sale", href: "/marketplace/vehicles" },
    { label: "Antiques for Sale", href: "/marketplace/antiques" },
    { label: "Sell an Item", href: "/sell" },
  ],
};

const COMPANY = {
  title: "Company",
  links: [
    { label: "About Us", href: "/about" },
    { label: "Our Process", href: "/#process" },
    { label: "Delivery & Returns", href: "/delivery" },
    {
      label: "Furniture Buying Guide",
      href: "/guides/buying-wooden-furniture-in-nairobi",
    },
    { label: "Contact", href: "/contact" },
  ],
};

/** Brand marks (lucide no longer ships brand icons). */
const SOCIAL = [
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z",
  },
  {
    label: "LinkedIn",
    href: siteConfig.social.linkedin,
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  },
];

export function SiteFooter() {
  const { region } = useRegion();
  const content = regionContent[region];

  // "Areas Served" is region-localised (Kenya neighbourhoods vs affluent Virginia areas).
  // Residences (and the developers listing them) are Nairobi-only, so these
  // links only show on the Kenya storefront.
  const property =
    region === "kenya"
      ? [
          ...(DEVELOPMENTS_LIVE ? [{ label: "New Developments", href: "/developments" }] : []),
          ...(RESIDENCES_LIVE
            ? [{ label: "Residences", href: "/residences" }, { label: "Developers & Agencies", href: "/developers" }]
            : []),
        ]
      : [];
  const services = property.length
    ? {
        ...SERVICES,
        links: SERVICES.links.flatMap((link) => (link.href === "/expat-services" ? [link, ...property] : [link])),
      }
    : SERVICES;

  const columns = [
    services,
    MARKETPLACE,
    {
      title: "Areas Served",
      links: content.areasServed.map((area) => ({ label: area, href: `/areas/${areaSlug(area)}` })),
    },
    COMPANY,
  ];

  return (
    <footer className="gradient-navy text-white">
      {/* Top: 24px mobile / 40px from sm up, which with the closing section's
          16/24px bottom pad gives the 40px / 64px gap above the logo grid.
          Bottom: 24px plus the iOS home-indicator inset. */}
      <div className="mx-auto max-w-7xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:gap-10">
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
              {SOCIAL.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`The Estate Edit on ${label}`}
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
                    <path d={path} />
                  </svg>
                </a>
              ))}
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

        {/* Certifications & Credentials — veteran-owned badge. This is the one place
            phone visitors see it (the header hides it below `sm`). */}
        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:gap-6">
          <Image
            src="/veteran-owned-badge.jpg"
            alt="Service-Disabled Veteran-Owned Small Business (SDVOSB) badge"
            width={500}
            height={375}
            className="h-24 w-auto shrink-0 self-start rounded-lg bg-white p-1"
          />
          <div>
            <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              Certifications &amp; Credentials
            </h4>
            <p className="mt-2 text-sm text-white/65">
              Service-Disabled Veteran-Owned Small Business (SDVOSB) · CVE Verified
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
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
                <span className="text-white/25" aria-hidden>
                  ·
                </span>
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
