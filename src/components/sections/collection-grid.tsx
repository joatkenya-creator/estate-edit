"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  assetCategoryLabel,
  divisionLabel,
  type CatalogueItem,
} from "@/lib/site";
import { CardAddToCart } from "@/components/collection/card-add-to-cart";

const toneGradient: Record<CatalogueItem["tone"], string> = {
  navy: "linear-gradient(145deg,#001628 0%,#002349 55%,#0c3563 100%)",
  charcoal: "linear-gradient(145deg,#141414 0%,#1f1f1f 55%,#3a3a3a 100%)",
  crimson: "linear-gradient(145deg,#3d0c0f 0%,#7c181d 55%,#b3242b 100%)",
  gold: "linear-gradient(145deg,#5c4019 0%,#9c7536 55%,#b68a4e 100%)",
};

const statusStyles: Record<CatalogueItem["status"], string> = {
  available: "bg-white/90 text-navy",
  reserved: "bg-gold text-navy",
  sold: "bg-crimson text-white",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        active
          ? "border-navy bg-navy text-white"
          : "border-border bg-white text-charcoal/70 hover:border-navy/40 hover:text-navy",
      )}
    >
      {children}
    </button>
  );
}

export function CollectionGrid({ items }: { items: CatalogueItem[] }) {
  const [division, setDivision] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const divisions = useMemo(
    () => Array.from(new Set(items.map((i) => i.division).filter(Boolean))),
    [items],
  );
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoryKey).filter(Boolean))),
    [items],
  );

  const filtered = items.filter(
    (i) =>
      (division === "all" || i.division === division) &&
      (category === "all" || i.categoryKey === category),
  );

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Filters */}
        <div className="flex flex-col gap-5 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Division
            </span>
            <Chip active={division === "all"} onClick={() => setDivision("all")}>
              All
            </Chip>
            {divisions.map((d) => (
              <Chip key={d} active={division === d} onClick={() => setDivision(d)}>
                {divisionLabel[d] ?? d}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Category
            </span>
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </Chip>
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {assetCategoryLabel[c] ?? c}
              </Chip>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Showing {filtered.length} {filtered.length === 1 ? "lot" : "lots"}
        </p>

        <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((asset) => (
              <motion.a
                key={asset.slug}
                href={`/collection/${asset.slug}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <CardAddToCart item={asset} />
                  <div className="absolute inset-0 scale-100 transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110">
                    <div className="absolute inset-0" style={{ background: toneGradient[asset.tone] }} />
                    {asset.imageUrl && (
                      <Image
                        src={asset.imageUrl}
                        alt={asset.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-white/5" />

                  <span
                    className={cn(
                      "absolute right-4 top-4 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest",
                      statusStyles[asset.status],
                    )}
                  >
                    {asset.status}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-gold-soft">
                      {asset.category}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-white">{asset.title}</h3>
                    {asset.meta && <p className="mt-1 text-xs text-white/70">{asset.meta}</p>}
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">
            No lots match this filter. Try another category.
          </p>
        )}
      </div>
    </section>
  );
}
