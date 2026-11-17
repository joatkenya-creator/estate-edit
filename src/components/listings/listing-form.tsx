"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Upload, CheckCircle2, CreditCard, X, RotateCcw, AlertCircle } from "lucide-react";
import { PayListingButton } from "@/components/listings/pay-listing-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createListing, updateListing, type ListingState } from "@/app/actions/listings";
import { useRegion } from "@/components/region/region-context";
import { compressImage, formatBytes, uploadListingImage } from "@/lib/image-upload";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_RULES, validateListing } from "@/lib/validation";
import {
  ContactFallback,
  DraftNotice,
  ErrorSummary,
  FieldError,
  FormAlert,
  useDraft,
  useFieldErrors,
  useOnline,
  useSlow,
  useSubmit,
} from "@/components/states/form-states";
import { cn } from "@/lib/utils";

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
  { value: "new", label: "New (never used)" },
  { value: "excellent", label: "Excellent (like new)" },
  { value: "very_good", label: "Very good (minimal signs of use)" },
  { value: "good", label: "Good (some wear)" },
  { value: "fair", label: "Fair (functional but worn)" },
];

const LABELS: Record<string, string> = {
  title: "Title",
  category: "Category",
  price: "Price",
  location: "Location",
  description: "Description",
  photos: "Photos",
};

/** The subset of a listing row this form edits. */
export type EditableListing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string | null;
  location: string | null;
  primary_image_url: string | null;
  status: string;
  /** Gallery photos in order (the first is the cover). */
  images?: string[];
};

type Props = {
  isFree: boolean;
  freeRemaining: number;
  userEmail: string;
  /** Paystack public key, read on the server at request time. */
  paystackKey: string;
  /**
   * Present = edit an existing listing instead of creating one. Same fields,
   * same validation, same photo upload — only the action and the wording
   * change, so the two flows cannot drift apart.
   */
  listing?: EditableListing;
  /** Preselected category (e.g. from "List a vehicle" on an empty category page). */
  defaultCategory?: string;
};

type Photo = {
  id: string;
  name: string;
  size: number;
  preview: string;
  progress: number;
  status: "uploading" | "done" | "error";
  url?: string;
  blob?: Blob;
  abort?: () => void;
};

const initial: ListingState = { status: "idle", message: "" };

export function ListingForm({ isFree, freeRemaining, userEmail, paystackKey, listing, defaultCategory }: Props) {
  const editing = Boolean(listing);
  const [state, submit, pending] = useSubmit(editing ? updateListing : createListing, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const online = useOnline();
  const { currency } = useRegion();
  const isKes = currency === "KES";
  const listingFee = isKes ? 500 : 8;
  const methodsLabel = isKes ? "card, bank or M-Pesa" : "card or bank";

  const startPhotos = listing
    ? (listing.images?.length ? listing.images : listing.primary_image_url ? [listing.primary_image_url] : [])
    : [];
  const [photos, setPhotos] = useState<Photo[]>(() => startPhotos.map(donePhoto));
  const donePhotos = photos.filter((p) => p.status === "done");
  const uploading = photos.some((p) => p.status === "uploading");
  const slowUpload = useSlow(uploading);
  const slowSubmit = useSlow(pending);

  const photoCount = useRef(donePhotos.length);
  useEffect(() => {
    photoCount.current = donePhotos.length;
  });
  const v = useFieldErrors((values) => validateListing(values, photoCount.current, currency));

  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  });

  // Drafts are per form: a new listing, or one per listing being edited.
  const draft = useDraft<string[]>(`ee:draft:listing:${listing?.id ?? "new"}`, formRef, {
    getExtra: () => photosRef.current.filter((p) => p.status === "done").map((p) => p.url!),
    onRestore: (urls) => setPhotos(urls ? urls.map(donePhoto) : startPhotos.map(donePhoto)),
  });

  /** Session ran out: keep the draft, sign in, come straight back here. */
  function signInAgain() {
    draft.save();
    const here = pathname + (search.size ? `?${search}` : "");
    router.push(`/auth/login?reason=expired&next=${encodeURIComponent(here)}`);
  }

  useEffect(() => {
    if (state.code === "auth") return signInAgain();
    if (state.status === "error") v.showErrors(state.fieldErrors);
    // Saved server-side, awaiting payment: the device copy is no longer needed.
    // (Plain success redirects to My Listings, which clears it there.)
    if (state.status === "payment_required") draft.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function startUpload(photo: Photo, blob: Blob) {
    const up = uploadListingImage(blob, (pct) =>
      setPhotos((ps) => ps.map((p) => (p.id === photo.id ? { ...p, progress: pct } : p))),
    );
    setPhotos((ps) => ps.map((p) => (p.id === photo.id ? { ...p, abort: up.abort, status: "uploading", progress: 0 } : p)));
    up.promise
      .then((url) => {
        setPhotos((ps) => ps.map((p) => (p.id === photo.id ? { ...p, url, status: "done", progress: 100, blob: undefined } : p)));
        v.setErrors((e) => {
          const next = { ...e };
          delete next.photos;
          return next;
        });
      })
      .catch((err: Error) => {
        if (err.message === "aborted") return;
        if (err.message === "auth") return signInAgain();
        setPhotos((ps) => ps.map((p) => (p.id === photo.id ? { ...p, status: "error" } : p)));
      });
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    const rejected: string[] = [];
    for (const file of Array.from(files).slice(0, Math.max(0, room))) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        rejected.push(`${file.name} is not a JPG, PNG or WebP photo.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        rejected.push(`${file.name} is ${formatBytes(file.size)}. Photos can be up to 10 MB each.`);
        continue;
      }
      const photo: Photo = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "uploading",
      };
      setPhotos((ps) => [...ps, photo]);
      const blob = await compressImage(file);
      setPhotos((ps) => ps.map((p) => (p.id === photo.id ? { ...p, size: blob.size, blob } : p)));
      startUpload(photo, blob);
    }
    if (files.length > room) rejected.push(`You can add up to ${MAX_PHOTOS} photos.`);
    if (rejected.length) v.setErrors((e) => ({ ...e, photos: rejected.join(" ") }));
  }

  function removePhoto(id: string) {
    setPhotos((ps) => {
      const p = ps.find((x) => x.id === id);
      p?.abort?.();
      if (p?.preview.startsWith("blob:")) URL.revokeObjectURL(p.preview);
      return ps.filter((x) => x.id !== id);
    });
  }

  /** The lighter path on a slow connection: keep what finished, post now. */
  function saveWithFinished() {
    photos.filter((p) => p.status !== "done").forEach((p) => removePhoto(p.id));
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!online || uploading) return;
    if (!v.validateAll(e.currentTarget)) return;
    submit(new FormData(e.currentTarget));
  }

  if (state.status === "payment_required") {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-6 text-center sm:p-8">
        <CreditCard className="mx-auto mb-4 size-12 text-gold" />
        <h3 className="font-display text-2xl text-navy">Your listing is saved. One step left.</h3>
        <p className="mt-2 text-sm text-charcoal/70">{state.message}</p>

        <div className="mx-auto mt-6 max-w-xs space-y-3">
          <PayListingButton
            listingId={state.listingId!}
            amount={state.feeAmount ?? listingFee}
            currency={currency}
            email={userEmail}
            paystackKey={paystackKey}
          />
          <p className="text-xs text-charcoal/50">
            Pay securely by {methodsLabel}. Your listing goes live immediately after payment is confirmed.
          </p>
        </div>
      </div>
    );
  }

  const urls = donePhotos.map((p) => p.url!);

  return (
    <form ref={formRef} onSubmit={onSubmit} {...v.formProps} className="space-y-8">
      {listing && <input type="hidden" name="id" value={listing.id} />}
      <input type="hidden" name="primary_image_url" value={urls[0] ?? ""} />
      <input type="hidden" name="image_urls" value={JSON.stringify(urls)} />

      {draft.restored && <DraftNotice onDiscard={draft.discard} />}

      {editing ? (
        <div className="rounded-lg border border-border bg-stone p-4 text-sm text-charcoal/70">
          Editing a live listing. Its web address stays the same, so any link you have already
          shared keeps working.
          {listing?.status === "rejected" && (
            <> This listing was rejected. Saving your changes sends it back for review.</>
          )}
        </div>
      ) : (
        <div
          className={`rounded-lg border p-4 text-sm ${
            isFree ? "border-green-200 bg-green-50 text-green-800" : "border-gold/30 bg-gold/5 text-gold-dark"
          }`}
        >
          {isFree ? (
            <>
              <CheckCircle2 className="mb-1 inline size-4 text-green-600" />{" "}
              <strong>Free listing:</strong> {freeRemaining} free slot{freeRemaining === 1 ? "" : "s"} remaining.
              Post your item at no cost.
            </>
          ) : (
            <>
              <strong>
                Paid listing: {currency} {listingFee}
              </strong>
              . You&apos;ve used both free slots. Complete the form and pay the one-time fee to
              publish your listing.
            </>
          )}
        </div>
      )}

      {v.summary && <ErrorSummary errors={v.errors} labels={LABELS} />}
      {state.status === "error" && !state.fieldErrors && state.code !== "auth" && (
        <FormAlert>
          {state.message} <ContactFallback />
        </FormAlert>
      )}

      {/* Basic info */}
      <section className="space-y-5">
        <h2 className="font-display text-lg text-navy">Item details</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={listing?.title}
            placeholder="e.g. Victorian mahogany dining table"
            maxLength={100}
            {...v.a11y("title", "title-hint")}
          />
          {v.errors.title ? (
            <FieldError name="title" message={v.errors.title} />
          ) : (
            <p id="title-hint" className="text-xs text-charcoal/50">
              Be specific and descriptive. No phone numbers.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              name="category"
              defaultValue={listing?.category ?? defaultCategory ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-crimson"
              {...v.a11y("category")}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <FieldError name="category" message={v.errors.category} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              name="condition"
              defaultValue={listing?.condition ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
            defaultValue={listing?.description ?? ""}
            rows={4}
            placeholder="Describe your item: dimensions, materials, age, any defects…"
            {...v.a11y("description", "description-hint")}
          />
          {v.errors.description ? (
            <FieldError name="description" message={v.errors.description} />
          ) : (
            <p id="description-hint" className="text-xs text-charcoal/50">Up to 2,000 characters.</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price ({currency}) *</Label>
            <Input
              id="price"
              name="price"
              inputMode={isKes ? "numeric" : "decimal"}
              defaultValue={listing?.price}
              placeholder={isKes ? "25000" : "250"}
              {...v.a11y("price", "price-hint")}
            />
            {v.errors.price ? (
              <FieldError name="price" message={v.errors.price} />
            ) : (
              <p id="price-hint" className="text-xs text-charcoal/50">
                Numbers only, without commas or {isKes ? "KES" : "$"}.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              defaultValue={listing?.location ?? ""}
              placeholder={isKes ? "Karen, Nairobi" : "McLean, VA"}
              {...v.a11y("location")}
            />
            <FieldError name="location" message={v.errors.location} />
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-lg text-navy">Photos *</h2>
          <p id="photos-hint" className="mt-1 text-xs text-charcoal/50">
            {PHOTO_RULES} Up to {MAX_PHOTOS}. The first photo is the cover.
          </p>
        </div>

        {photos.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p, i) => (
              <li key={p.id} className="relative overflow-hidden rounded-lg border border-border bg-stone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={`Photo ${i + 1}`} className="aspect-square w-full object-cover" />
                {i === 0 && p.status === "done" && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-navy/85 px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  aria-label={p.status === "uploading" ? `Cancel upload of photo ${i + 1}` : `Remove photo ${i + 1}`}
                  className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-navy text-white shadow"
                >
                  <X className="size-4" />
                </button>
                <div className="space-y-1 bg-white px-2 py-1.5 text-[0.7rem] text-charcoal/60">
                  {p.status === "uploading" && (
                    <>
                      <div
                        role="progressbar"
                        aria-label={`Uploading photo ${i + 1}`}
                        aria-valuenow={p.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-1.5 overflow-hidden rounded-full bg-stone-deep"
                      >
                        <div className="h-full bg-gold transition-[width]" style={{ width: `${p.progress}%` }} />
                      </div>
                      <p className="flex justify-between">
                        <span>{p.progress}%</span>
                        {p.size > 0 && <span>{formatBytes(p.size)}</span>}
                      </p>
                    </>
                  )}
                  {p.status === "done" && (
                    <p className="flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="size-3" aria-hidden /> Uploaded
                      {p.size > 0 && <span className="ml-auto text-charcoal/50">{formatBytes(p.size)}</span>}
                    </p>
                  )}
                  {p.status === "error" && (
                    <button
                      type="button"
                      onClick={() => p.blob && startUpload(p, p.blob)}
                      className="flex items-center gap-1 text-crimson underline-offset-2 hover:underline"
                    >
                      <AlertCircle className="size-3" aria-hidden /> Failed. Retry
                      <RotateCcw className="size-3" aria-hidden />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {photos.length < MAX_PHOTOS && (
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-stone/40 py-7 text-sm text-charcoal/70 transition-colors hover:bg-stone focus-within:ring-2 focus-within:ring-ring",
              v.errors.photos ? "border-crimson/60" : "border-border",
            )}
          >
            <Upload className="size-5" aria-hidden />
            {photos.length ? "Add more photos" : "Choose photos"}
            <span className="text-xs text-charcoal/50">From your gallery, files or camera</span>
            <input
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
              className="sr-only"
              aria-invalid={v.errors.photos ? true : undefined}
              aria-describedby={v.errors.photos ? "photos-error" : "photos-hint"}
            />
          </label>
        )}
        <FieldError name="photos" message={v.errors.photos} />

        {slowUpload && (
          <FormAlert tone="info">
            This is taking longer than usual.{" "}
            {donePhotos.length > 0 ? (
              <button type="button" onClick={saveWithFinished} className="font-medium underline underline-offset-2">
                Save the listing with the {donePhotos.length} photo{donePhotos.length === 1 ? "" : "s"} that
                have finished and add the rest later
              </button>
            ) : (
              <>Keep this page open. Uploads continue in the background.</>
            )}
          </FormAlert>
        )}
      </section>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={pending || uploading || !online}
          className="h-11 w-full bg-navy text-white hover:bg-navy-soft"
          size="lg"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              {editing ? "Saving…" : "Sending…"}
            </>
          ) : editing ? (
            "Save changes"
          ) : isFree ? (
            "Submit free listing"
          ) : (
            "Continue to payment"
          )}
        </Button>
        <p aria-live="polite" className="text-center text-xs text-charcoal/60">
          {!online
            ? "You're offline. Your listing is saved on this device. You can submit it when you're back online."
            : uploading
              ? "Waiting for photos to finish uploading."
              : slowSubmit
                ? "This is taking longer than usual. Your details are saved on this device, so nothing is lost if you need to try again."
                : ""}
        </p>
      </div>
    </form>
  );
}

function donePhoto(url: string): Photo {
  return { id: url, name: "", size: 0, preview: url, progress: 100, status: "done", url };
}
