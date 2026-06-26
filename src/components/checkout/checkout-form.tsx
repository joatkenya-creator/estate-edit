"use client";

import { useMemo, useState } from "react";
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
  kenyaCounties,
  type DeliverySettings,
} from "@/lib/site";
import { useCart } from "@/components/cart/cart-context";
import { useCurrency } from "@/components/currency/currency-context";
import { CurrencyNote } from "@/components/currency/price";
import { placeOrder } from "@/lib/orders";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CheckoutForm({ settings }: { settings: DeliverySettings }) {
  const { items, subtotal, ready, clear } = useCart();
  const { format } = useCurrency();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currency = items[0]?.currency ?? "KES";
  const deliveryFee = useMemo(
    () => computeDeliveryFee(settings, county, items),
    [settings, county, items],
  );
  const freeDelivery = settings.enabled && deliveryFee === 0;
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
    if (!fullName.trim() || !phone.trim() || !county || !address.trim()) {
      toast.error("Please fill in your name, phone, county and delivery address.");
      return;
    }
    setSubmitting(true);
    try {
      const { orderNumber } = await placeOrder({
        fullName,
        phone,
        email,
        county,
        town,
        address,
        deliveryNotes: notes,
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
          We deliver countrywide. Pay after delivery (cash or M-Pesa).
        </p>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name *</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Mwangi" required />
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
              <Label htmlFor="county">County *</Label>
              <select id="county" value={county} onChange={(e) => setCounty(e.target.value)} className={selectClass} required>
                <option value="">Select county…</option>
                {kenyaCounties.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="town">Town / area</Label>
              <Input id="town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="Westlands, Nyali…" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Delivery address *</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Estate / building, street, landmark" rows={2} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Delivery notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferred time, gate access, etc." rows={2} />
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
                  {format(it.price * it.quantity)}
                </p>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums text-charcoal">{format(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery{county ? ` · ${county}` : ""}</dt>
              <dd className="tabular-nums text-charcoal">
                {freeDelivery ? "Free" : format(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-medium text-navy">Total</dt>
              <dd className="font-display text-lg text-navy tabular-nums">{format(total)}</dd>
            </div>
          </dl>

          <CurrencyNote className="mt-3 text-xs text-muted-foreground" />

          {!county && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="size-3.5" /> Select your county to see the delivery fee.
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
            No payment now, pay on delivery. We&apos;ll call to confirm.
          </p>
        </div>
      </div>
    </form>
  );
}
