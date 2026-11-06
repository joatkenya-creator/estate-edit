import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "tiktok" | "instagram";

const platformLabel: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram" };

/**
 * The platform's own embed frame for a public video URL, or null if the URL
 * isn't one we recognise. These are the same iframes TikTok's and Instagram's
 * `embed.js` inject, used directly so no third-party script runs on the page
 * and the CSP only needs `frame-src` entries (see next.config.ts).
 */
function embedSrc(url: string): { src: string; platform: Platform } | null {
  const tiktok = url.match(/tiktok\.com\/(?:@[^/]+\/video|embed(?:\/v2)?)\/(\d+)/);
  if (tiktok) return { src: `https://www.tiktok.com/embed/v2/${tiktok[1]}`, platform: "tiktok" };
  const instagram = url.match(/instagram\.com\/(reels?|p|tv)\/([\w-]+)/);
  if (instagram) {
    const kind = instagram[1] === "reels" ? "reel" : instagram[1];
    return { src: `https://www.instagram.com/${kind}/${instagram[2]}/embed`, platform: "instagram" };
  }
  return null;
}

/**
 * A vertical (9:16) video tour slot. With no (or an unrecognised) URL it shows
 * a placeholder; otherwise the official embed, lazy-loaded by the browser so
 * off-screen tours cost nothing on first paint.
 */
export function VideoEmbed({
  url,
  platform,
  title,
  className,
}: {
  url?: string;
  platform?: Platform;
  title: string;
  className?: string;
}) {
  const embed = url ? embedSrc(url) : null;
  const label = platform ?? embed?.platform;

  return (
    <div className={cn("relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-navy-deep", className)}>
      {embed ? (
        <iframe
          src={embed.src}
          title={title}
          loading="lazy"
          allow="encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-white/10 text-center">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full border border-gold-soft/60 text-gold-soft"
          >
            <Play className="size-5 translate-x-0.5" strokeWidth={1.6} />
          </span>
          <p className="px-4 text-xs uppercase tracking-[0.24em] text-white/75">
            {title}
            {label && ` (${platformLabel[label]})`}
          </p>
        </div>
      )}
    </div>
  );
}
