"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/site";

const STORAGE_KEY = "ee_cart_v1";

type AddInput = Omit<CartItem, "quantity">;

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  /** True once the cart has hydrated from localStorage (avoids SSR mismatch). */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: AddInput, qty?: number) => void;
  setQuantity: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Load persisted cart once on mount. We intentionally hydrate from
  // localStorage in an effect (not a lazy initializer) so the first client
  // render matches the server's empty cart — consumers gate on `ready` to avoid
  // any flash/mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist on change (after hydration so we don't clobber stored data).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [items, ready]);

  const add = useCallback((item: AddInput, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.slug === item.slug);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.slug !== slug)
        : prev.map((p) => (p.slug === slug ? { ...p, quantity: qty } : p)),
    );
  }, []);

  const remove = useCallback(
    (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug)),
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const it of items) {
      count += it.quantity;
      subtotal += it.price * it.quantity;
    }
    return { count, subtotal };
  }, [items]);

  const value: CartContextValue = {
    items,
    isOpen,
    ready,
    count,
    subtotal,
    add,
    setQuantity,
    remove,
    clear,
    open: () => setOpen(true),
    close: () => setOpen(false),
    setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
