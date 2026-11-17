"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-images";
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Public URL prefix of every listing photo; the server only accepts URLs under it. */
export const LISTING_IMAGE_PREFIX = `${BASE}/storage/v1/object/public/${BUCKET}/`;

/**
 * Shrink a photo before it leaves the phone: longest side 2000px, WebP (JPEG
 * where the browser can't encode WebP). A 6 MB camera shot usually ends up
 * well under 1 MB, which is what makes uploads bearable on mobile data.
 * Anything that fails here falls back to the original file.
 */
export async function compressImage(file: File, max = 2000): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));
    let blob = await encode("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export type Upload = { promise: Promise<string>; abort: () => void };

/**
 * Upload with real progress. supabase-js uses fetch, which can't report
 * upload progress, so this posts to the same Storage endpoint with XHR using
 * the signed-in user's token. Resolves to the photo's public URL.
 */
export function uploadListingImage(blob: Blob, onProgress: (pct: number) => void): Upload {
  const xhr = new XMLHttpRequest();
  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  const path = `listings/${crypto.randomUUID()}.${ext}`;

  const promise = (async () => {
    const { data } = await createClient().auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("auth");
    return new Promise<string>((resolve, reject) => {
      xhr.open("POST", `${BASE}/storage/v1/object/${BUCKET}/${path}`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader("cache-control", "max-age=3600");
      xhr.setRequestHeader("content-type", blob.type || "image/jpeg");
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve(LISTING_IMAGE_PREFIX + path)
          : reject(new Error(xhr.status === 401 || xhr.status === 403 ? "auth" : `upload ${xhr.status}`));
      xhr.onerror = () => reject(new Error("network"));
      xhr.onabort = () => reject(new Error("aborted"));
      xhr.send(blob);
    });
  })();

  return { promise, abort: () => xhr.abort() };
}

export function formatBytes(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}
