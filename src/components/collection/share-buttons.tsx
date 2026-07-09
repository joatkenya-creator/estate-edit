"use client";

import { useState } from "react";
import { MessageCircle, Link2, Check } from "lucide-react";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.1-2.4-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.8V13h2.75v8h2.95z" />
    </svg>
  );
}

/** Per-item share row — WhatsApp (big in Kenya), Facebook, and copy-link. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} — ${url}`);
  const enc = encodeURIComponent(url);

  const cls =
    "inline-flex size-9 items-center justify-center rounded-full border border-border text-charcoal/70 transition-colors hover:border-navy hover:text-navy";

  return (
    <div className="mt-6 flex items-center gap-2">
      <span className="mr-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Share</span>
      <a
        href={`https://wa.me/?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={cls}
      >
        <MessageCircle className="size-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={cls}
      >
        <FacebookIcon />
      </a>
      <button
        type="button"
        aria-label="Copy link"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            },
            () => {},
          );
        }}
        className={cls}
      >
        {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
