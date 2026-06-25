"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useCurrency } from "@/components/currency/currency-context";
import { CurrencyNote } from "@/components/currency/price";

export function CartDrawer() {
  const { items, isOpen, setOpen, count, subtotal, setQuantity, remove } = useCart();
  const { format } = useCurrency();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full gap-0 bg-white sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-xl text-navy">
            Your cart {count > 0 && <span className="text-muted-foreground">({count})</span>}
          </SheetTitle>
          <SheetDescription>Pay after delivery. We deliver countrywide.</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button asChild variant="outline" onClick={() => setOpen(false)}>
              <Link href="/collection">Browse the collection</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {items.map((it) => (
                <div key={it.slug} className="flex gap-3 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-stone">
                    {it.imageUrl && (
                      <Image src={it.imageUrl} alt={it.title} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/collection/${it.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium text-navy hover:underline"
                    >
                      {it.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-charcoal/70">
                      {format(it.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(it.slug, it.quantity - 1)}
                          className="grid size-7 place-items-center text-charcoal/70 hover:text-navy"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums">{it.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(it.slug, it.quantity + 1)}
                          className="grid size-7 place-items-center text-charcoal/70 hover:text-navy"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => remove(it.slug)}
                        className="grid size-7 place-items-center text-muted-foreground hover:text-crimson"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-navy tabular-nums">
                    {format(it.price * it.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg text-navy">
                  {format(subtotal)}
                </span>
              </div>
              <CurrencyNote className="text-xs text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Delivery is calculated at checkout.
              </p>
              <Button asChild size="lg" className="h-12 bg-navy text-white hover:bg-navy-soft">
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Checkout
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
