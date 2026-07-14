import Link from "next/link";

/**
 * Cross-links the service/collection pages with descriptive, keyword-rich
 * anchor text (good for SEO + helps users discover the full offering). Drop
 * `<RelatedServices current="..." />` on a page and it links to all the others.
 */
type ServiceKey =
  | "estate-sales"
  | "commercial-liquidation"
  | "concierge"
  | "expat-services"
  | "collection";

const LINKS: Record<ServiceKey, { href: string; anchor: string }> = {
  "estate-sales": { href: "/estate-sales", anchor: "luxury estate sales" },
  "commercial-liquidation": {
    href: "/commercial-liquidation",
    anchor: "commercial liquidation",
  },
  concierge: { href: "/concierge", anchor: "downsizing and relocation concierge services" },
  "expat-services": { href: "/expat-services", anchor: "expatriate relocation services" },
  collection: { href: "/collection", anchor: "luxury assets for sale" },
};

const ORDER: ServiceKey[] = [
  "estate-sales",
  "commercial-liquidation",
  "concierge",
  "expat-services",
  "collection",
];

export function RelatedServices({ current }: { current: ServiceKey }) {
  const others = ORDER.filter((k) => k !== current);

  return (
    <section className="bg-stone/40 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="eyebrow mb-3">Explore more</p>
        <h2 className="font-display text-2xl font-light text-navy text-balance sm:text-3xl">
          One firm for the entire transition
        </h2>
        <p className="mt-5 leading-relaxed text-charcoal/80 text-pretty">
          The Estate Edit also offers{" "}
          {others.map((k, i) => (
            <span key={k}>
              <Link
                href={LINKS[k].href}
                className="font-medium text-navy underline decoration-gold/50 underline-offset-4 transition-colors hover:decoration-gold"
              >
                {LINKS[k].anchor}
              </Link>
              {i < others.length - 1 ? (i === others.length - 2 ? ", and " : ", ") : "."}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
