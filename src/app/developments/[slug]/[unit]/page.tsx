import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { BuyerEnquiry } from "@/components/developments/buyer-enquiry";
import {
  Attribution,
  DevelopmentCtas,
  MediaSlot,
  MobileBar,
  UnitTypeCard,
  developerOf,
} from "@/components/developments/development-ui";
import {
  bedBathLabel,
  developmentHref,
  formatPrice,
  formatSize,
  getDevelopment,
  getDevelopments,
  getUnitType,
  type Room,
} from "@/lib/developments";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph, clampDescription, clampTitle } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDevelopments().flatMap((d) => d.unitTypes.map((u) => ({ slug: d.slug, unit: u.slug })));
}

type Props = { params: Promise<{ slug: string; unit: string }> };

async function load(params: Props["params"]) {
  const { slug, unit } = await params;
  const d = getDevelopment(slug);
  const u = d && getUnitType(d, unit);
  return d && u ? { d, u } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { d, u } = found;
  const path = developmentHref(d, u);
  const title = clampTitle(`${u.name}, ${u.sizeSqft} sq ft | ${d.name}`, 60);
  const description = clampDescription(
    `${u.name} at ${d.name}, ${d.locationName}: ${bedBathLabel(u)}, ${formatSize(u.sizeSqft)}. Floor plan, room sizes and 3D animation.`,
  );
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: buildOpenGraph({ title, description, path }),
  };
}

function RoomTable({ rooms, caption }: { rooms: Room[]; caption: string }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="pb-2 text-left text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{caption}</caption>
      <tbody className="divide-y divide-border">
        {rooms.map((r, i) => (
          <tr key={`${r.name}-${i}`}>
            <th scope="row" className="py-2.5 pr-4 font-normal text-charcoal">{r.name}</th>
            <td className="py-2.5 text-right font-medium tabular-nums text-navy">{r.size ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function UnitTypePage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { d, u } = found;
  const developer = developerOf(d);
  const others = d.unitTypes.filter((o) => o.slug !== u.slug);
  const floors = [...new Set(u.rooms.map((r) => r.floor))];

  const facts: [string, string][] = [
    ["Size", formatSize(u.sizeSqft)],
    ["Bedrooms", String(u.bedrooms)],
    ["Bathrooms", `${u.bathrooms}${u.hasSq ? " + DSQ bath" : ""}`],
    ["Homes of this type", String(u.unitCount)],
    ["Available", u.unitsAvailable === null ? "Contact sales" : String(u.unitsAvailable)],
    ["Price", formatPrice(u.priceFromKes)],
  ];

  return (
    <main className="flex-1 pb-16 md:pb-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "New Developments", path: "/developments" },
          { name: d.name, path: developmentHref(d) },
          { name: u.name },
        ])}
      />

      <PageHero
        eyebrow={`${d.name} · ${d.locationName}`}
        title={u.name}
        subtitle={`${bedBathLabel(u)} · ${formatSize(u.sizeSqft)}`}
        crumbs={[
          { label: "New Developments", href: "/developments" },
          { label: d.name, href: developmentHref(d) },
          { label: u.name },
        ]}
      >
        <p className="mt-4 font-display text-2xl text-white">{formatPrice(u.priceFromKes)}</p>
        <div className="mt-8">
          <DevelopmentCtas dev={d} unit={u} dark />
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="grid min-w-0 gap-6">
            {u.category === "maisonette" ? (
              <>
                <MediaSlot label="Ground floor" />
                <MediaSlot label="First floor" />
                <MediaSlot label="Your private garden" />
              </>
            ) : (
              <MediaSlot label={u.name} />
            )}
            <MediaSlot label="Floor plan" aspect="aspect-[4/3]" />
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-3xl font-light text-navy">Key facts</h2>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
              {facts.map(([label, value]) => (
                <div key={label} className="bg-white p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
                  <dd className="mt-1.5 font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-10 font-display text-3xl font-light text-navy">Room sizes</h2>
            <div className="mt-4 grid gap-6">
              {floors.map((floor) => (
                <RoomTable
                  key={floor ?? "all"}
                  caption={floor ?? "From the architect's drawing"}
                  rooms={u.rooms.filter((r) => r.floor === floor)}
                />
              ))}
            </div>

            {u.features.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-3xl font-light text-navy">Features</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {u.features.map((f) => (
                    <li key={f} className="rounded-full border border-lotus-green/30 px-3 py-1 text-sm text-lotus-green">{f}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="enquire" className="bg-stone py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <p className="eyebrow mb-3">Enquire</p>
          <h2 className="font-display text-3xl font-light text-navy">Ask about the {u.name}</h2>
          <div className="mt-8 rounded-2xl border border-border bg-white p-6 sm:p-9">
            <BuyerEnquiry
              development={{ slug: d.slug, name: d.name, developerLegalName: developer.legalName }}
              unitTypes={d.unitTypes.map((o) => ({ slug: o.slug, name: o.name }))}
              unit={u.slug}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-light text-navy">Other homes at {d.name}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <UnitTypeCard key={o.slug} dev={d} unit={o} />
            ))}
          </div>
        </div>
      </section>

      <Attribution dev={d} />
      <MobileBar dev={d} unit={u} />
    </main>
  );
}
