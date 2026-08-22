import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { ListingCard } from "@/components/listings/listing-card";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { getMarketplaceListings } from "@/lib/queries";
import { placesIn } from "@/lib/marketplace.server";
import { getRegion } from "@/lib/region.server";
import { siteConfig } from "@/lib/site";
import { SITE_URL, breadcrumbJsonLd, buildOpenGraph } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/guides/buying-wooden-furniture-in-nairobi";
const TITLE = "Buying Wooden Furniture in Nairobi: What to Check Before You Pay";
const DESCRIPTION =
  "A practical checklist for buying wooden beds, dining tables and cabinets in Nairobi — how to read timber and joinery, what treated wood actually means, standard Kenyan bed sizes, and how to inspect a piece before you pay.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Estate Edit` },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: PATH,
    type: "article",
  }),
};

/**
 * The first editorial guide, and the template for the rest.
 *
 * Its job is not keyword volume. Someone searching "wooden bed Nairobi" is
 * mid-decision and has real questions — what treated timber means, whether the
 * joinery will survive a move, what 5/6 actually measures. Answering those
 * honestly is what earns the visit, and the page then hands the reader the
 * listings that match. Every claim here is either a stated convention or a
 * check the reader can perform themselves; nothing is asserted about any
 * particular seller's stock.
 */
export default async function BuyingWoodenFurnitureGuide() {
  const region = await getRegion();
  const allFurniture = await getMarketplaceListings(region, "furniture", "");
  const furniture = allFurniture.slice(0, 4);
  const furniturePlaces = placesIn(allFurniture).slice(0, 6);

  return (
    <main className="flex-1">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides" },
          { name: "Buying Wooden Furniture in Nairobi" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          mainEntityOfPage: `${SITE_URL}${PATH}`,
          author: { "@type": "Organization", name: siteConfig.name },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />

      <PageHero
        eyebrow="Buying Guide"
        title="Buying wooden furniture in Nairobi"
        subtitle="What to look at, what to ask, and what to measure before you hand over money — whether you are buying from a workshop on Ngong Road or a family clearing a house in Karen."
        crumbs={[{ label: "Guides" }, { label: "Wooden Furniture" }]}
      />

      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="space-y-10 text-[0.95rem] leading-relaxed text-charcoal/80">
          <section>
            <h2 className="font-display text-2xl text-navy">What &ldquo;treated&rdquo; timber means</h2>
            <p className="mt-3">
              Treated timber has been chemically preserved against termites, borers and rot. In
              Kenya it is usually pressure-treated or dipped, and it matters most for anything that
              will sit against a wall or on a concrete floor. Ask the seller what the piece was
              treated with and when. If the wood smells strongly of chemicals it is likely recent;
              if it has been treated and then sealed, you should see an even finish rather than raw
              grain at the joints and undersides.
            </p>
            <p className="mt-3">
              Cypress (often written &ldquo;cyprus&rdquo; locally) is one of the most common
              furniture softwoods in Kenya — light, stable, straight-grained and considerably
              cheaper than mahogany or mvule. Treated well and finished properly, it makes solid
              beds and tables. It also dents more easily than a hardwood, so check the top surfaces
              of a table rather than only the frame.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy">Kenyan bed sizes, decoded</h2>
            <p className="mt-3">
              Beds are sold here in feet, not centimetres. &ldquo;4/6&rdquo; means 4ft by 6ft;
              &ldquo;5/6&rdquo; means 5ft by 6ft — roughly 152cm by 183cm of mattress. A
              6/6 is the local equivalent of a king. The frame will always be a little larger than
              the mattress it takes, so when a seller quotes a measurement, confirm whether it is
              the mattress size or the outside frame — that difference is what decides whether the
              bed clears your bedroom door.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy">The five-minute inspection</h2>
            <ul className="mt-3 space-y-3">
              <li>
                <strong className="text-navy">Joints.</strong> Look underneath. Mortise-and-tenon or
                dowelled joints last; joints held together with nails and filler do not. Rock the
                piece gently — a frame that flexes at the corners will loosen further after a move.
              </li>
              <li>
                <strong className="text-navy">Moisture.</strong> Furniture built from wood that was
                not properly dried warps. Sight along the length of a table top and along each bed
                rail; you want straight lines, not a slow curve.
              </li>
              <li>
                <strong className="text-navy">Borer holes.</strong> Small round holes with fine
                powder underneath mean active infestation, not just age. Walk away, or budget for
                immediate treatment.
              </li>
              <li>
                <strong className="text-navy">Finish.</strong> A natural clear finish shows the
                grain and is easy to touch up. A heavy opaque finish can be hiding filler. Run a
                hand over the edges — sharp, unsanded edges signal a rushed build.
              </li>
              <li>
                <strong className="text-navy">Fit.</strong> Measure your doorway, stairwell and lift
                before you buy, not after. Ask whether the piece can be dismantled.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy">Buying safely from a private seller</h2>
            <p className="mt-3">
              Most furniture in Nairobi changes hands directly between people, which is usually
              cheaper and occasionally risky. Two rules cover almost everything: see the item in
              person before you pay, and pay only once you have seen it. Meet during daylight, meet
              at the address where the item actually is, and take a photo of the piece as agreed.
              For anything above a few thousand shillings, agree delivery and who is paying for it
              before you settle the price, not after.
            </p>
            <p className="mt-3">
              On{" "}
              <Link href="/marketplace" className="text-navy underline underline-offset-4">
                The Estate Edit Marketplace
              </Link>{" "}
              you deal with the seller directly — we publish the listing and the seller&apos;s
              contact details, and the money never passes through us. That means the inspection is
              entirely yours to do, and it is worth doing properly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy">New workshop piece or estate piece?</h2>
            <p className="mt-3">
              A newly built piece gets you exact dimensions and a fresh finish. A piece from an
              estate clearance is usually better timber for the money — furniture built twenty
              years ago from mature hardwood is not something a workshop can reproduce at the same
              price today. If you want the second kind, look at{" "}
              <Link href="/collection" className="text-navy underline underline-offset-4">
                The Collection
              </Link>
              , which is catalogued and valued by us, or the{" "}
              <Link
                href="/marketplace/antiques"
                className="text-navy underline underline-offset-4"
              >
                antiques listings
              </Link>{" "}
              on the marketplace.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy">Where to look</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Built from where the stock actually is, not a hardcoded list —
                  a link to an empty locality page helps nobody and is noindexed
                  at the other end anyway. */}
              <Link
                href="/marketplace/furniture"
                className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
              >
                Furniture for sale in Kenya
              </Link>
              {furniturePlaces.map(({ place, count }) => (
                <Link
                  key={place.slug}
                  href={`/marketplace/furniture/${place.slug}`}
                  className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
                >
                  Furniture for sale in {place.label}
                  <span className="ml-1.5 text-charcoal/35">{count}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {furniture.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-navy">Wooden furniture listed right now</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {furniture.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
            <Button asChild className="mt-8 bg-navy text-white hover:bg-navy-soft">
              <Link href="/marketplace/furniture">See all furniture listings</Link>
            </Button>
          </section>
        )}
      </article>

      <CtaBand
        title="Clearing a house, or downsizing?"
        subtitle="We catalogue, value and sell entire estates — and list individual pieces for sellers who would rather handle the sale themselves."
      />
    </main>
  );
}
