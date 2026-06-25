"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatMoney } from "@/lib/site";
import { KES_RATES_URL, currencyForCountry } from "@/lib/currency";

type CurrencyContextValue = {
  /** Display currency (KES when Kenyan / undetected). */
  currency: string;
  /** True when showing a non-KES converted price. */
  converting: boolean;
  ready: boolean;
  /** Format a KES amount in the visitor's display currency. */
  format: (amountKes: number, base?: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const RATES_KEY = "ee_rates_v1";
const COUNTRY_KEY = "ee_country_v1";
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("KES");
  const [rate, setRate] = useState<number | null>(null); // 1 KES -> `currency`
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) Detect the visitor's country -> target currency.
      let country: string | null = null;
      try {
        country = sessionStorage.getItem(COUNTRY_KEY);
      } catch {
        /* ignore */
      }
      if (!country) {
        try {
          const text = await fetch("/cdn-cgi/trace", { cache: "no-store" }).then((r) => r.text());
          country = text.match(/loc=([A-Z]{2})/)?.[1] ?? null;
        } catch {
          /* ignore */
        }
        if (!country) {
          try {
            country = new Intl.Locale(navigator.language).maximize().region ?? null;
          } catch {
            /* ignore */
          }
        }
        if (country) {
          try {
            sessionStorage.setItem(COUNTRY_KEY, country);
          } catch {
            /* ignore */
          }
        }
      }

      const target = currencyForCountry(country);
      if (cancelled) return;
      if (target === "KES") {
        setReady(true);
        return; // Kenyan / unknown — no conversion.
      }

      // 2) Get cached or fresh KES rates.
      let rates: Record<string, number> | null = null;
      try {
        const raw = sessionStorage.getItem(RATES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.rates && Date.now() - parsed.t < TWELVE_HOURS) rates = parsed.rates;
        }
      } catch {
        /* ignore */
      }
      if (!rates) {
        try {
          const data = await fetch(KES_RATES_URL).then((r) => r.json());
          if (data?.result === "success" && data.rates) {
            rates = data.rates as Record<string, number>;
            try {
              sessionStorage.setItem(RATES_KEY, JSON.stringify({ t: Date.now(), rates }));
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* ignore — fall back to KES display */
        }
      }
      if (cancelled) return;

      const r = rates?.[target];
      if (r && r > 0) {
        setCurrency(target);
        setRate(r);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const converting = currency !== "KES" && rate != null;

  const format = useCallback(
    (amountKes: number, base = "KES") => {
      if (base !== "KES" || !converting || rate == null) return formatMoney(amountKes, base);
      return formatMoney(amountKes * rate, currency);
    },
    [converting, rate, currency],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, converting, ready, format }),
    [currency, converting, ready, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
