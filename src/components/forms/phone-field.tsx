"use client";

import { useEffect, useState } from "react";
import PhoneInput, { type Country, type Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";

/**
 * International phone field: searchable country dropdown (flags + dial code),
 * with the default country auto-detected from the visitor's location via
 * Cloudflare's free `/cdn-cgi/trace` endpoint (falls back to the browser locale,
 * then Kenya). Submits the full E.164 number (e.g. +254712345678) through a
 * hidden input, so the existing form + server action keep reading `phone`.
 */
export function PhoneField({
  id = "phone",
  name = "phone",
  placeholder = "712 345678",
  required = false,
}: {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState<Value | undefined>();
  const [country, setCountry] = useState<Country>("KE");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let detected: string | undefined;
      try {
        const res = await fetch("/cdn-cgi/trace", { cache: "no-store" });
        detected = (await res.text()).match(/loc=([A-Z]{2})/)?.[1];
      } catch {
        // ignore — fall back below
      }
      if (!detected) {
        try {
          detected = new Intl.Locale(navigator.language).maximize().region ?? undefined;
        } catch {
          // ignore — keep Kenya default
        }
      }
      if (!cancelled) {
        if (detected) setCountry(detected as Country);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ee-phone">
      {ready ? (
        <PhoneInput
          id={id}
          international
          defaultCountry={country}
          value={value}
          onChange={setValue}
          inputComponent={Input}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        // Skeleton while we detect the country (keeps layout stable).
        <div
          className="h-8 w-full animate-pulse rounded-lg border border-input bg-input/30"
          aria-hidden
        />
      )}
      {/* Full E.164 number (with country code) submitted to the server action. */}
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}
