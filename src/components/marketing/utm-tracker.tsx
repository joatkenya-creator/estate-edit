"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/** Captures first-touch UTM/referrer into a cookie on load. Renders nothing. */
export function UtmTracker() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
