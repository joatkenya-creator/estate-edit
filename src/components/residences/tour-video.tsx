"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { ResidenceTour } from "@/lib/residences";
import { cn } from "@/lib/utils";

/**
 * A landscape (16:9) walkthrough: a silent teaser loop with the poster, then
 * the full tour on request. The full tour plays our own MP4 (Supabase Storage)
 * with captions, or the YouTube copy when that URL isn't configured.
 * The teaser stays paused for visitors who prefer reduced motion.
 */
export function TourVideo({ tour, title, className }: { tour: ResidenceTour; title: string; className?: string }) {
  const [full, setFull] = useState(false);
  const teaser = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) teaser.current?.play().catch(() => {});
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-navy-deep">
        {!full ? (
          <>
            <video
              key="teaser"
              ref={teaser}
              muted
              loop
              playsInline
              preload="metadata"
              poster={tour.poster}
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover"
            >
              <source src={`${tour.teaserBase}.webm`} type="video/webm" />
              <source src={`${tour.teaserBase}.mp4`} type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={() => setFull(true)}
              className="group absolute inset-0 flex items-end justify-start bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="inline-flex items-center gap-3 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-navy transition-colors group-hover:bg-gold-soft">
                <Play className="size-4" aria-hidden="true" />
                Watch the full tour (8 min)
                <span className="sr-only">: {title}</span>
              </span>
            </button>
          </>
        ) : tour.fullVideoUrl ? (
          // Own key: React would otherwise reuse the teaser's <video>, and swapping
          // <source> children never makes the browser load the new file.
          <video
            key="full"
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={tour.poster}
            title={title}
            className="absolute inset-0 size-full bg-black"
          >
            <source src={tour.fullVideoUrl} type="video/mp4" />
            <track kind="captions" src={tour.captions} srcLang="en" label="English" default />
          </video>
        ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${tour.youtubeId}?autoplay=1&cc_load_policy=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Also on{" "}
        <a
          href={`https://www.youtube.com/watch?v=${tour.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-navy underline underline-offset-4 hover:text-gold"
        >
          YouTube
        </a>
        .
      </p>
    </div>
  );
}
