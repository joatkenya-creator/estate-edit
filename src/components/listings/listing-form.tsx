"use client";

import { useActionState, useState } from "react";
import { Loader2, Upload, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createListing, type ListingState } from "@/app/actions/listings";
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

type Props = { isFree: boolean; freeRemaining: number };

const initial: ListingState = { status: "idle", message: "" };

export function ListingForm({ isFree, freeRemaining }: Props) {
  const [state, action, pending] = useActionState(createListing, initial);
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);

  async function handlePayListing() {
    if (!state.listingId || !phone) {
      toast.error("Enter your M-Pesa phone number first.");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: state.listingId, phone }),
      });
      const data = await res.json() as { error?: string; message?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Payment initiation failed.");
      } else {
        toast.success(data.message ?? "Check your phone for the M-Pesa prompt.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
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
          <Label htmlFor="mpesa_phone">Your M-Pesa number</Label>
          <Input
            id="mpesa_phone"
            type="tel"
            placeholder="+254 700 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            onClick={handlePayListing}
            disabled={paying || !phone}
            className="w-full bg-green-600 text-white hover:bg-green-700"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay KES ${state.feeAmount?.toLocaleString()} via M-Pesa`
            )}
          </Button>
          <p className="text-xs text-charcoal/50">
            You will receive an M-Pesa prompt on your phone. Enter your PIN to complete payment.
            Your listing goes live immediately after payment is confirmed.
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
            Post your item at no cost. We earn 10% commission only when it sells.
          </>
        ) : (
          <>
            <strong>Paid listing — KES 500</strong>. You&apos;ve used both free slots.
            Complete the form and pay the one-time fee to publish your listing.
            We earn 10% commission on your sale.
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
            <Label htmlFor="price">Price (KES) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              min={1}
              step={100}
              placeholder="25000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Karen, Nairobi"
            />
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="space-y-4">
        <h2 className="font-display text-lg text-navy">Photo</h2>
        <div className="space-y-1.5">
          <Label htmlFor="primary_image_url">Primary image URL</Label>
          <Input
            id="primary_image_url"
            name="primary_image_url"
            type="url"
            placeholder="https://…"
          />
          <p className="flex items-center gap-1.5 text-xs text-charcoal/40">
            <Upload className="size-3" />
            Paste a direct image link (Google Drive, Dropbox, Cloudinary, etc.).
            Image upload coming soon.
          </p>
        </div>
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
