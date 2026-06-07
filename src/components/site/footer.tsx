import Link from "next/link";
import { Camera, Globe } from "lucide-react";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Services",
    links: [
      { label: "Estate Sales", href: "/estate-sales" },
      { label: "Commercial Liquidation", href: "/commercial-liquidation" },
      { label: "Expat Services", href: "/expat-services" },
      { label: "The Collection", href: "/collection" },
    ],
  },
  {
    title: "Areas Served",
    links: [
      { label: "Karen", href: "/contact" },
      { label: "Runda", href: "/contact" },
      { label: "Muthaiga", href: "/contact" },
      { label: "Lavington", href: "/contact" },
      { label: "Kilimani", href: "/contact" },
      { label: "Westlands", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Process", href: "/#process" },
      { label: "The Collection", href: "/collection" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="gradient-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-2xl">The Estate Edit</div>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.32em] text-gold-soft">
              Nairobi · East Africa
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/65">
              {siteConfig.description}
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
          <p className="flex items-center gap-2">
            <span>{siteConfig.phone}</span>
            <span className="text-white/25">·</span>
            <span>{siteConfig.email}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
