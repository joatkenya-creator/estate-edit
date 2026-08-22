"use client";

import { useEffect } from "react";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { listingEnquiryText, type SeoListing } from "@/lib/marketplace";

/**
 * The enquiry block on a listing page — and the only thing standing between a
 * Google visitor and the seller, so it is deliberately the loudest element on
 * the page.
 *
 * Kenya is mobile-first, so on small screens the same actions are pinned to a
 * sticky bar at the bottom of the viewport: a buyer who has scrolled through
 * the photos never has to scroll back up to make contact. On desktop the bar
 * is hidden and the inline buttons do the work.
 *
 * Every action fires a GA4 event (see lib/analytics) so the seller-facing
 * numbers are measured, never estimated.
 */
export function ListingContact({
  listing,
  url,
  phone,
  email,
}: {
  listing: SeoListing;
  url: string;
  phone?: string | null;
  email?: string | null;
}) {
  const eventParams = {
    listing_slug: listing.slug,
    listing_title: listing.title,
    category: listing.category ?? undefined,
    location: listing.location ?? undefined,
    value: Number(listing.price),
    currency: listing.currency || "KES",
  };

  useEffect(() => {
    track("listing_view", eventParams);
    // Once per listing page view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.slug]);

  const message = encodeURIComponent(listingEnquiryText(listing, url));
  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}` : null;
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;
  const mailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        `Enquiry: ${listing.title}`,
      )}&body=${message}`
    : null;

  const onContact = (kind: "whatsapp_click" | "phone_click" | "enquiry_click") => () => {
    track(kind, eventParams);
    track("seller_contact", { ...eventParams, method: kind });
  };

  if (!waHref && !telHref && !mailHref) {
    return (
      <p className="mt-5 text-center text-sm text-charcoal/50">
        This seller hasn&apos;t added contact details yet.
      </p>
    );
  }

  return (
    <>
      <div className="mt-5 space-y-3">
        {waHref && (
          <Button asChild className="w-full bg-green-600 py-6 text-base text-white hover:bg-green-700">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onContact("whatsapp_click")}
            >
              <MessageCircle className="mr-2 size-5" />
              WhatsApp the seller
            </a>
          </Button>
        )}
        {telHref && (
          <Button
            asChild
            variant="outline"
            className="w-full border-navy py-6 text-base text-navy hover:bg-navy/5"
          >
            <a href={telHref} onClick={onContact("phone_click")}>
              <Phone className="mr-2 size-4" />
              Call the seller
            </a>
          </Button>
        )}
        {mailHref && (
          <Button asChild className="w-full bg-navy py-6 text-base text-white hover:bg-navy-soft">
            <a href={mailHref} onClick={onContact("enquiry_click")}>
              <Mail className="mr-2 size-4" />
              Email the seller
            </a>
          </Button>
        )}
        <p className="text-center text-xs text-charcoal/45">
          You deal with the seller directly. Estate Edit does not hold your payment.
        </p>
      </div>

      {/* Mobile sticky enquiry bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-8px_24px_-18px_rgba(0,35,73,0.6)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-charcoal/50">{listing.title}</p>
            <p className="font-display text-lg font-semibold leading-tight text-navy">
              {listing.currency || "KES"} {Number(listing.price).toLocaleString("en-KE")}
            </p>
          </div>
          {waHref ? (
            <Button asChild className="bg-green-600 text-white hover:bg-green-700">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onContact("whatsapp_click")}
              >
                <MessageCircle className="mr-1.5 size-4" />
                WhatsApp
              </a>
            </Button>
          ) : telHref ? (
            <Button asChild className="bg-navy text-white hover:bg-navy-soft">
              <a href={telHref} onClick={onContact("phone_click")}>
                <Phone className="mr-1.5 size-4" />
                Call
              </a>
            </Button>
          ) : (
            mailHref && (
              <Button asChild className="bg-navy text-white hover:bg-navy-soft">
                <a href={mailHref} onClick={onContact("enquiry_click")}>
                  <Mail className="mr-1.5 size-4" />
                  Email
                </a>
              </Button>
            )
          )}
        </div>
      </div>
      {/* Spacer so the sticky bar never covers the last of the page content. */}
      <div aria-hidden className="h-20 lg:hidden" />
    </>
  );
}
