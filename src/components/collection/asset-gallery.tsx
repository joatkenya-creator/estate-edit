"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetDetail, AssetImage } from "@/lib/site";

const toneGradient: Record<AssetDetail["tone"], string> = {
  navy: "linear-gradient(145deg,#001628 0%,#002349 55%,#0c3563 100%)",
  charcoal: "linear-gradient(145deg,#141414 0%,#1f1f1f 55%,#3a3a3a 100%)",
  crimson: "linear-gradient(145deg,#3d0c0f 0%,#7c181d 55%,#b3242b 100%)",
  gold: "linear-gradient(145deg,#5c4019 0%,#9c7536 55%,#b68a4e 100%)",
};

const statusStyles: Record<AssetDetail["status"], string> = {
  available: "bg-white/90 text-navy",
  reserved: "bg-gold text-navy",
  sold: "bg-crimson text-white",
};

/**
 * Interactive asset gallery. Shows a cover image (the first item — the editor's
 * chosen thumbnail) with a clickable thumbnail strip when there's more than one
 * image, and a full-screen lightbox to browse every image. A single-image asset
 * simply shows that image (still zoomable), with no thumbnail strip.
 */
export function AssetGallery({
  images,
  tone,
  status,
  title,
}: {
  images: AssetImage[];
  tone: AssetDetail["tone"];
  status: AssetDetail["status"];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;
  const hasMultiple = count > 1;
  // Guard against an active index that falls out of range.
  const current = images[active] ?? images[0];

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight" && hasMultiple) go(1);
      else if (e.key === "ArrowLeft" && hasMultiple) go(-1);
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll behind the overlay.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, hasMultiple, go]);

  if (count === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <div className="absolute inset-0" style={{ background: toneGradient[tone] }} />
        <span className="absolute inset-0 flex items-center justify-center font-display text-8xl text-white/10">
          EE
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="View image full screen"
        className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0" style={{ background: toneGradient[tone] }} />
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span
          className={cn(
            "absolute right-4 top-4 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest",
            statusStyles[status],
          )}
        >
          {status}
        </span>
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-3.5" />
          {hasMultiple ? `View all ${count}` : "View"}
        </span>
      </button>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <button
              type="button"
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg ring-offset-2 transition-all",
                i === active
                  ? "ring-2 ring-navy"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} images`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-6" />
          </button>

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous image"
              className="absolute left-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-7" />
            </button>
          )}

          <div
            className="relative h-full max-h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={current.url}
              src={current.url}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next image"
              className="absolute right-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-7" />
            </button>
          )}

          {hasMultiple && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {active + 1} / {count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
