import Image from "next/image";
import { BadgeCheck, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, companyInitials, type Company } from "@/lib/companies";
import type { ResidenceStatus } from "@/lib/residences";

/*
 * Small presentational pieces shared by every residence/company surface, so
 * material from different companies always renders the same way.
 */

const logoSizes = {
  sm: { box: "size-10 rounded-md p-1 text-sm", px: "40px" },
  lg: { box: "size-[88px] rounded-lg p-2.5 text-2xl", px: "88px" },
};

/** Fixed box, contained logo on a neutral ground; initials in the accent colour when there's no logo. */
export function CompanyLogo({ company, size = "sm" }: { company: Company; size?: keyof typeof logoSizes }) {
  const s = logoSizes[size];
  if (!company.logoUrl) {
    return (
      <span
        aria-hidden="true"
        className={cn("flex shrink-0 items-center justify-center bg-gold font-display font-semibold text-navy", s.box)}
      >
        {companyInitials(company.name)}
      </span>
    );
  }
  return (
    <span className={cn("relative block shrink-0 overflow-hidden border border-border bg-stone", s.box)}>
      <span className="relative block size-full">
        <Image src={company.logoUrl} alt="" fill sizes={s.px} className="object-contain" />
      </span>
    </span>
  );
}

const VERIFIED = "Verified by The Estate Edit";

/** One icon + tooltip. Unverified companies render nothing (no negative label). */
export function VerifiedMark({ company, className }: { company: Company; className?: string }) {
  if (!company.verified) return null;
  return (
    <span
      tabIndex={0}
      role="img"
      aria-label={VERIFIED}
      className={cn("group/verified relative inline-flex shrink-0 rounded-full text-gold outline-none focus-visible:ring-2 focus-visible:ring-navy", className)}
    >
      <BadgeCheck className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
      <span
        aria-hidden="true"
        // display:none (not visibility) while hidden, so the bubble never widens the page at 375px.
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2.5 py-1.5 text-xs font-normal normal-case tracking-normal text-white shadow-md group-hover/verified:block group-focus-visible/verified:block"
      >
        {VERIFIED}
      </span>
    </span>
  );
}

/** "Developer" / "Agency" tags; `dark` for use on the navy hero. */
export function RoleTags({ company, dark = false }: { company: Company; dark?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Roles">
      {company.roles.map((role) => (
        <li
          key={role}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-widest",
            dark ? "border-white/30 text-white/85" : "border-navy/20 bg-stone text-navy",
          )}
        >
          {ROLE_LABEL[role]}
        </li>
      ))}
    </ul>
  );
}

const statusStyles: Record<ResidenceStatus, string> = {
  "For sale": "bg-white/90 text-navy",
  "For rent": "bg-gold text-navy",
  "New listing": "bg-gold text-navy",
  "Under offer": "bg-navy text-white ring-1 ring-white/30",
  Sold: "bg-crimson text-white",
};

/** `label` overrides the text (e.g. "For rent · Furnished"); `status` still picks the colour. */
export function StatusBadge({ status, label, className }: { status: ResidenceStatus; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest",
        statusStyles[status],
        className,
      )}
    >
      {label ?? status}
    </span>
  );
}

/** The one "no media yet" slot, used on cards and detail pages alike. Fills its (aspect-ratio) parent. */
export function MediaPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-navy-deep text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full border border-gold-soft/60 text-gold-soft"
      >
        <Play className="size-5 translate-x-0.5" strokeWidth={1.6} />
      </span>
      <p className="px-4 text-xs uppercase tracking-[0.24em] text-white/75">Video tour coming soon</p>
    </div>
  );
}
