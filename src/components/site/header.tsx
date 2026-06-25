"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { navLinks, siteConfig } from "@/lib/site";
import { CartButton } from "@/components/cart/cart-button";

function Wordmark({ inverted }: { inverted: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3">
      {/* Gold monogram — keeps its colour on any background */}
      <Image
        src="/logo-mark.svg"
        alt=""
        width={46}
        height={40}
        priority
        unoptimized
        className="h-9 w-auto sm:h-10"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl tracking-[0.02em] transition-colors sm:text-2xl",
            inverted ? "text-white" : "text-navy",
          )}
        >
          The Estate Edit
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6rem] uppercase tracking-[0.34em] transition-colors",
            inverted ? "text-gold-soft" : "text-gold",
          )}
        >
          Nairobi · East Africa
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const inverted = !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/70 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_-20px_rgba(0,35,73,0.4)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Wordmark inverted={inverted} />

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "group relative text-sm font-medium tracking-wide transition-colors",
                inverted ? "text-white/85 hover:text-white" : "text-charcoal/75 hover:text-navy",
              )}
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="hidden bg-navy text-white hover:bg-navy-soft sm:inline-flex"
          >
            <Link href="/contact">Book a Consultation</Link>
          </Button>

          <CartButton inverted={inverted} />

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-md border transition-colors lg:hidden",
                  inverted
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-border text-navy hover:bg-stone",
                )}
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-navy text-white border-navy-soft">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl text-white">
                  The Estate Edit
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Link
                      href={link.href}
                      className="border-b border-white/10 py-4 text-lg text-white/85 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 p-6">
                <SheetClose asChild>
                  <Button asChild className="bg-gold text-navy hover:bg-gold-soft">
                    <Link href="/contact">Book a Consultation</Link>
                  </Button>
                </SheetClose>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="text-center text-xs text-white/60 transition-colors hover:text-gold"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
