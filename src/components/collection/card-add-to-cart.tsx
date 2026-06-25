"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { isPurchasable, type CatalogueItem } from "@/lib/site";

/**
 * Quick "Add" button overlaid on a collection card for buyable items. Renders
 * nothing for price-on-request / sold pieces (those stay Enquire-only).
 */
export function CardAddToCart({ item }: { item: CatalogueItem }) {
  const { add } = useCart();

  if (!isPurchasable({ price: item.price, priceOnRequest: item.priceOnRequest, status: item.status })) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={`Add ${item.title} to cart`}
      onClick={(e) => {
        // The card is a link — don't navigate when adding to cart.
        e.preventDefault();
        e.stopPropagation();
        add({
          slug: item.slug,
          title: item.title,
          price: item.price as number,
          currency: item.currency ?? "KES",
          imageUrl: item.imageUrl,
          deliveryTier: item.deliveryTier,
          fragile: item.fragile,
        });
      }}
      className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm backdrop-blur transition-colors hover:bg-white"
    >
      <ShoppingBag className="size-3.5" />
      Add
    </button>
  );
}
