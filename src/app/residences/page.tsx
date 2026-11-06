import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { VideoEmbed } from "@/components/residences/video-embed";
import { ResidenceBrowser } from "@/components/residences/residence-browser";
import { filmCompany, getResidences, videoTours } from "@/lib/residences";
import { OG_IMAGE, SITE_URL, breadcrumbJsonLd, buildOpenGraph } from "@/lib/seo";

const PATH = "/residences";
// The root layout's template appends " · The Estate Edit".
const TITLE = "Luxury Homes for Sale in Nairobi";
const DESCRIPTION =
  "Luxury residences for sale in Karen, Runda, Muthaiga, Lavington, Kilimani and Westlands, each with a filmed video tour. Private viewings by appointment.";

// Kenya-only page (Nairobi homes): one canonical on the apex, no hreflang pair,
// same as the Nairobi furniture guide. Filtered views (?area=, ?company=, …)
// canonicalise here rather than competing as near-duplicate pages.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// The listings read filters from the URL (useSearchParams), so render per
// request: a shared ?company=…&beds=4 link then arrives already filtered.
export const dynamic = "force-dynamic";

/**
 * Luxury residences for sale in Nairobi — a template with SAMPLE listings and
 * placeholder video tours (see src/lib/residences.ts).
 */
export default function ResidencesPage() {
  const residences = getResidences();
  // The hero features the first residence that has its own filmed tour.
  const featured = residences.find((r) => r.videoUrl);

  return (
    <main className="flex-1">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Residences", path: PATH },
          { name: "Nairobi" },
        ])}
      />

      {/* 1. Hero — PageHero's treatment, split into two columns for the video. */}
      <section className="relative isolate overflow-hidden gradient-navy">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute -right-24 top-0 hidden size-[28rem] rounded-full bg-gold/10 blur-[120px] sm:block" />
        <div className="pointer-events-none absolute -left-24 bottom-0 hidden size-[24rem] rounded-full bg-crimson/10 blur-[120px] sm:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-36 sm:px-8 sm:pb-24 sm:pt-44 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-white/55">
              <Link href="/" className="transition-colors hover:text-gold">
                Home
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link href={PATH} className="transition-colors hover:text-gold">
                Residences
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <span className="text-white/80">Nairobi</span>
            </nav>

            <p className="eyebrow mb-5">Luxury Residences</p>
            <h1 className="max-w-3xl font-display text-4xl font-light leading-[1.05] text-white text-balance sm:text-6xl">
              Distinguished homes in Nairobi, presented like fine-art lots.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 text-pretty sm:text-lg">
              A private selection of residences in Karen, Runda, Muthaiga, Lavington, Kilimani and
              Westlands from Nairobi&apos;s developers and agencies, each with a filmed walkthrough,
              so you can tour before you visit.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="group h-13 bg-gold px-8 text-base text-navy hover:bg-gold-soft">
                <a href="#listings">
                  View residences
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 border-white/30 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">Book a private viewing</Link>
              </Button>
            </div>
          </div>

          <VideoEmbed
            url={featured?.videoUrl}
            title={featured ? `${featured.name}: video tour` : "Featured tour"}
            className="mx-auto max-w-xs lg:mr-0"
          />
        </div>
      </section>

      {/* 2. Listings — filters, sort and page all live in the URL. */}
      <ResidenceBrowser items={residences} heading="Available residences" />

      {/* 3. On film */}
      <section className="gradient-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow mb-4">On film</p>
          <h2 className="max-w-2xl text-balance font-display text-3xl font-light text-white sm:text-4xl">
            Walk through before you visit
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Short tours of homes and stays from {filmCompany.name}. See more on their{" "}
            <a href={filmCompany.tiktok} target="_blank" rel="noopener noreferrer" className="text-white underline">
              TikTok
            </a>{" "}
            and{" "}
            <a href={filmCompany.instagram} target="_blank" rel="noopener noreferrer" className="text-white underline">
              Instagram
            </a>
            .
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videoTours.map((tour) => (
              <VideoEmbed
                key={tour.title}
                url={tour.url}
                platform={tour.platform}
                title={tour.title}
                className="mx-auto max-w-xs sm:max-w-none"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Seller call to action */}
      <section className="bg-stone py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-balance font-display text-3xl font-light text-navy sm:text-5xl">
            Selling a distinguished home?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-charcoal/75 text-pretty">
            We value, film and present your residence to a private network of qualified buyers,
            with complete discretion, from first conversation to handover.
          </p>
          <Button asChild size="lg" className="group mt-9 h-13 bg-navy px-8 text-base text-white hover:bg-navy-soft">
            <Link href="/contact">
              Book a consultation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
