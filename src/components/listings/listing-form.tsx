"use client";

import { useActionState, useState } from "react";
import { Loader2, Upload, CheckCircle2, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createListing, type ListingState } from "@/app/actions/listings";
import { useRegion } from "@/components/region/region-context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "furniture", label: "Furniture" },
  { value: "fine_art", label: "Fine Art" },
  { value: "jewelry", label: "Jewellery & Watches" },
  { value: "vehicles", label: "Vehicles" },
  { value: "collectibles", label: "Collectibles" },
  { value: "designer", label: "Designer Goods" },
  { value: "lighting", label: "Lighting" },
  { value: "rugs", label: "Rugs & Carpets" },
  { value: "antiques", label: "Antiques" },
  { value: "equipment", label: "Equipment & Tools" },
  { value: "inventory", label: "Inventory" },
  { value: "office", label: "Office Furniture" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "new", label: "New — never used" },
  { value: "excellent", label: "Excellent — like new" },
  { value: "very_good", label: "Very good — minimal signs of use" },
  { value: "good", label: "Good — some wear" },
  { value: "fair", label: "Fair — functional but worn" },
];

type Props = { isFree: boolean; freeRemaining: number; userEmail: string };

const initial: ListingState = { status: "idle", message: "" };

type PaystackHandler = { openIframe: () => void };
type PaystackPop = {
  setup: (opts: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    channels: string[];
    metadata?: Record<string, unknown>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackHandler;
};
declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

/** Load Paystack's inline popup script once. */
function loadPaystack(): Promise<PaystackPop> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () =>
      window.PaystackPop ? resolve(window.PaystackPop) : reject(new Error("Paystack unavailable"));
    s.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(s);
  });
}

export function ListingForm({ isFree, freeRemaining, userEmail }: Props) {
  const [state, action, pending] = useActionState(createListing, initial);
  const [paying, setPaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const { currency } = useRegion();
  const isKes = currency === "KES";
  const listingFee = isKes ? 500 : 8;
  // Kenya can pay by card, bank or M-Pesa; other markets by card or bank.
  const channels = isKes ? ["card", "bank", "mobile_money"] : ["card", "bank"];
  const methodsLabel = isKes ? "card, bank or M-Pesa" : "card or bank";

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `listings/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast.success("Photo uploaded.");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function verifyPayment(reference: string) {
    try {
      const res = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, listingId: state.listingId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        toast.success("Payment confirmed — your listing is under review and will go live shortly.");
        window.location.href = "/account/listings";
      } else {
        toast.error(data.error ?? "We couldn't confirm the payment. If you were charged, contact us.");
        setPaying(false);
      }
    } catch {
      toast.error("Could not confirm the payment. Please try again.");
      setPaying(false);
    }
  }

  async function handlePayListing() {
    if (!state.listingId) return;
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      toast.error("Payments are not configured yet. Please try again later.");
      return;
    }
    setPaying(true);
    try {
      const Paystack = await loadPaystack();
      const reference = `EE-${state.listingId.slice(0, 8)}-${Date.now().toString(36)}`;
      const handler = Paystack.setup({
        key,
        email: userEmail,
        amount: Math.round((state.feeAmount ?? listingFee) * 100),
        currency,
        ref: reference,
        channels,
        metadata: { listingId: state.listingId },
        callback: (response) => {
          void verifyPayment(response.reference);
        },
        onClose: () => setPaying(false),
      });
      handler.openIframe();
    } catch {
      toast.error("Could not open the payment window. Please try again.");
      setPaying(false);
    }
  }

  if (state.status === "payment_required") {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-8 text-center">
        <CreditCard className="mx-auto mb-4 size-12 text-gold" />
        <h3 className="font-display text-2xl text-navy">Almost there!</h3>
        <p className="mt-2 text-sm text-charcoal/70">{state.message}</p>

        <div className="mx-auto mt-6 max-w-xs space-y-3">
          <Button
            onClick={handlePayListing}
            disabled={paying}
            size="lg"
            className="w-full bg-navy text-white hover:bg-navy-soft"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ${currency} ${(state.feeAmount ?? listingFee).toLocaleString()}`
            )}
          </Button>
          <p className="text-xs text-charcoal/50">
            Pay securely by {methodsLabel}. Your listing goes live immediately after payment is confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {/* Free tier banner */}
      <div className={`rounded-lg border p-4 text-sm ${
        isFree
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-gold/30 bg-gold/5 text-gold-dark"
      }`}>
        {isFree ? (
          <>
            <CheckCircle2 className="mb-1 inline size-4 text-green-600" />{" "}
            <strong>Free listing</strong> — {freeRemaining} free slot{freeRemaining === 1 ? "" : "s"} remaining.
            Post your item at no cost.
          </>
        ) : (
          <>
            <strong>Paid listing — {currency} {listingFee}</strong>. You&apos;ve used both free slots.
            Complete the form and pay the one-time fee to publish your listing.
          </>
        )}
      </div>

      {state.status === "error" && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {/* Basic info */}
      <section className="space-y-5">
        <h2 className="font-display text-lg text-navy">Item details</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="e.g. Victorian mahogany dining table"
            maxLength={100}
          />
          <p className="text-xs text-charcoal/40">Be specific and descriptive. No phone numbers.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              name="condition"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select condition</option>
              {CONDITIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe your item — dimensions, materials, age, any defects…"
            maxLength={2000}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price ({currency}) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              min={1}
              step="0.01"
              placeholder="25000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder={isKes ? "Karen, Nairobi" : "McLean, VA"}
            />
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="space-y-4">
        <h2 className="font-display text-lg text-navy">Photo</h2>
        <input type="hidden" name="primary_image_url" value={imageUrl} />
        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Listing preview"
              className="aspect-square w-40 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              aria-label="Remove photo"
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-navy text-white shadow"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-stone/40 py-8 text-sm text-charcoal/60 transition-colors hover:bg-stone">
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
            {uploading ? "Uploading…" : "Click to upload a photo"}
            <span className="text-xs text-charcoal/40">JPG or PNG, up to 5 MB</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </section>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-navy text-white hover:bg-navy-soft"
        size="lg"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting…
          </>
        ) : isFree ? (
          "Submit free listing"
        ) : (
          "Continue to payment"
        )}
      </Button>
    </form>
  );
}
