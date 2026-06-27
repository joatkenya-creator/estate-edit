"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/forms/phone-field";
import {
  computeDeliveryFee,
  formatMoney,
  usStates,
  type DeliverySettings,
} from "@/lib/site";
import { useCart } from "@/components/cart/cart-context";
import { placeOrder } from "@/lib/orders";
import { quoteDelivery } from "@/app/actions/delivery-quote";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Sentinel for the Virginia "deliver somewhere outside Virginia" choice. */
const OUTSIDE = "__outside__";

export function CheckoutForm({ settings }: { settings: DeliverySettings }) {
  const { items, subtotal, ready, clear } = useCart();
  const router = useRouter();

  const isVirginia = settings.market === "virginia";
  const areaLabel = settings.areaLabel;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [usState, setUsState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currency = items[0]?.currency ?? settings.currency;

  // Virginia: a destination outside the local delivery area defers shipping to
  // a manual quote (no auto fee). Kenya never offers this.
  const isOutside = settings.quoteOutsideArea && county === OUTSIDE;

  // Immediate estimate from the cart snapshot…
  const localFee = useMemo(
    () => (isOutside ? 0 : computeDeliveryFee(settings, county, items)),
    [settings, county, items, isOutside],
  );

  // …superseded by an authoritative server quote (recomputed from the current
  // product tiers by slug), so a stale cart can't mis-price delivery.
  const slugsKey = items.map((i) => i.slug).join(",");
  const [quoted, setQuoted] = useState<{ county: string; fee: number } | null>(null);
  useEffect(() => {
    if (!county || isOutside) return;
    const slugs = slugsKey ? slugsKey.split(",") : [];
    if (!slugs.length) return;
    let active = true;
    quoteDelivery(slugs, county, subtotal)
      .then((fee) => {
        if (active) setQuoted({ county, fee });
      })
      .catch(() => {
        /* keep the local estimate on failure */
      });
    return () => {
      active = false;
    };
  }, [county, slugsKey, subtotal, isOutside]);

  const deliveryFee = isOutside
    ? 0
    : quoted && quoted.county === county
      ? quoted.fee
      : localFee;
  const freeDelivery = settings.enabled && !isOutside && deliveryFee === 0;
  const total = subtotal + deliveryFee;

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground/40" />
        <h2 className="mt-4 font-display text-2xl text-navy">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add an item from the collection to check out.
        </p>
        <Button asChild className="mt-6 bg-navy text-white hover:bg-navy-soft">
          <Link href="/collection">Browse the collection</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const destinationOk = isOutside ? Boolean(usState) : Boolean(county);
    if (!fullName.trim() || !phone.trim() || !destinationOk || !address.trim()) {
      toast.error(
        `Please fill in your name, phone, ${areaLabel.toLowerCase()} and delivery address.`,
      );
      return;
    }
    setSubmitting(true);
    try {
      const { orderNumber } = await placeOrder({
        fullName,
        phone,
        email,
        market: settings.market,
        county: isOutside ? "" : county,
        town,
        state: isVirginia ? (isOutside ? usState : "Virginia") : undefined,
        postalCode: postalCode || undefined,
        country: isVirginia ? "US" : "KE",
        address,
        deliveryNotes: notes,
        deliveryQuotePending: isOutside,
        items,
        subtotal,
        deliveryFee,
        total,
        currency,
        source: "checkout",
      });
      clear();
      const params = new URLSearchParams({
        order: orderNumber,
        total: String(total),
        currency,
      });
      router.push(`/checkout/confirmation?${params.toString()}`);
    } catch (err) {
      console.error(err);
      toast.error("Sorry, we couldn't place your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
      {/* Delivery details */}
      <div>
        <h2 className="font-display text-2xl text-navy">Delivery details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isVirginia
            ? "Local delivery across Virginia. Pay on delivery (cash)."
            : "We deliver countrywide. Pay after delivery (cash or M-Pesa)."}
        </p>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name *</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isVirginia ? "Jane Carter" : "Jane Mwangi"} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <PhoneField id="phone" name="_phone_hidden" required onValueChange={setPhone} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="county">{areaLabel} *</Label>
              <select id="county" value={county} onChange={(e) => setCounty(e.target.value)} className={selectClass} required>
                <option value="">Select {areaLabel.toLowerCase()}…</option>
                {settings.areas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {settings.quoteOutsideArea && (
                  <option value={OUTSIDE}>Outside Virginia (quote shipping)</option>
                )}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="town">Town / city</Label>
              <Input id="town" value={town} onChange={(e) => setTown(e.target.value)} placeholder={isVirginia ? "City / area" : "Westlands, Nyali…"} />
            </div>
          </div>

          {isOutside && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="us_state">State *</Label>
                <select id="us_state" value={usState} onChange={(e) => setUsState(e.target.value)} className={selectClass} required>
                  <option value="">Select state…</option>
                  {usStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP code</Label>
                <Input id="zip" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="23220" />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="address">Delivery address *</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={isVirginia ? "Street address, unit, landmark" : "Estate / building, street, landmark"} rows={2} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Delivery notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferred time, access details, etc." rows={2} />
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-border bg-stone/40 p-6">
          <h2 className="font-display text-xl text-navy">Order summary</h2>

          <div className="mt-4 divide-y divide-border">
            {items.map((it) => (
              <div key={it.slug} className="flex gap-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-white">
                  {it.imageUrl && (
                    <Image src={it.imageUrl} alt={it.title} fill sizes="56px" className="object-cover" />
                  )}
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-navy px-1 text-[0.65rem] font-semibold text-white">
                    {it.quantity}
                  </span>
                </div>
                <p className="min-w-0 flex-1 text-sm text-charcoal">{it.title}</p>
                <p className="text-sm font-medium text-navy tabular-nums">
                  {formatMoney(it.price * it.quantity, currency)}
                </p>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums text-charcoal">{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Delivery{county && !isOutside ? ` · ${county}` : ""}
              </dt>
              <dd className="tabular-nums text-charcoal">
                {isOutside ? "Quoted after order" : freeDelivery ? "Free" : formatMoney(deliveryFee, currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-medium text-navy">Total</dt>
              <dd className="font-display text-lg text-navy tabular-nums">{formatMoney(total, currency)}</dd>
            </div>
          </dl>

          {!county && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="size-3.5" /> Select your {areaLabel.toLowerCase()} to see the delivery fee.
            </p>
          )}
          {isOutside && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="size-3.5" /> Shipping outside Virginia is quoted after you place the order.
            </p>
          )}

          <Button type="submit" disabled={submitting} size="lg" className="mt-5 h-12 w-full bg-navy text-white hover:bg-navy-soft">
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /> Placing order…</>
            ) : (
              "Place order"
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {isVirginia
              ? "No payment now. Pay cash on delivery. We'll call to confirm."
              : "No payment now, pay on delivery. We'll call to confirm."}
          </p>
        </div>
      </div>
    </form>
  );
}
