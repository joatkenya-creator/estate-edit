import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaSlot, developerOf, whatsappHref } from "@/components/developments/development-ui";
import { developmentHref, formatSize, getDevelopments, minSizeSqft } from "@/lib/developments";
import { getRegion } from "@/lib/region.server";
import { DEVELOPMENTS_LIVE } from "@/lib/site";

/** Homepage feature band for the lead development (brief 7.7). Kenya storefront only. */
export async function DevelopmentBand() {
  const d = getDevelopments()[0];
  if (!DEVELOPMENTS_LIVE || !d || (await getRegion()) !== "kenya") return null;
  const from = minSizeSqft(d);

  return (
    <section className="bg-lotus-green py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4 !text-lotus-pink">New development</p>
          <h2 className="font-display text-4xl font-light text-white sm:text-5xl">{d.name}</h2>
          <p className="mt-2 text-white/70">by {developerOf(d).name}</p>
          <p className="mt-6 text-lg text-white/85">
            {d.totalUnits ? `${d.totalUnits} homes` : d.locationName}
            {from ? ` · from ${formatSize(from)}` : ""}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-13 bg-white px-8 text-base text-lotus-green hover:bg-white/90">
              <Link href={developmentHref(d)}>
                Explore {d.name}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 border-white/40 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white">
              <a href={whatsappHref(d)} target="_blank" rel="noopener noreferrer">
                WhatsApp us<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          </div>
        </div>
        <MediaSlot label="Aerial view" className="bg-black/20" />
      </div>
    </section>
  );
}
