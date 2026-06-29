"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User, Tag } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navLinks, siteConfig } from "@/lib/site";
import { regionFlag, regionShort, regionTagline } from "@/lib/region";
import { useRegion } from "@/components/region/region-context";
import { CartButton } from "@/components/cart/cart-button";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/actions/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function Wordmark({ inverted }: { inverted: boolean }) {
  const { region } = useRegion();
  return (
    <Link href="/" className="group mr-4 flex shrink-0 items-center gap-3 lg:mr-8">
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
          {/* Auto-detected store region (from the visitor's location). Display only. */}
          <sup
            title="Your store region, detected automatically from your location"
            className={cn(
              "ml-1 align-super text-[0.55rem] font-semibold not-italic tracking-wide",
              inverted ? "text-gold-soft" : "text-gold",
            )}
          >
            {regionFlag[region]} {regionShort[region]}
          </sup>
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6rem] uppercase tracking-[0.34em] transition-colors",
            inverted ? "text-gold-soft" : "text-gold",
          )}
        >
          {regionTagline[region]}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { region } = useRegion();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
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

        <nav className="hidden items-center gap-6 lg:flex xl:gap-9">
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

          {/* Sell link */}
          <Link
            href="/sell"
            className={cn(
              "group relative flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors",
              inverted ? "text-gold-soft hover:text-gold" : "text-gold hover:text-gold-dark",
            )}
          >
            <Tag className="size-3.5" />
            Sell
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            asChild
            className="hidden bg-navy text-white hover:bg-navy-soft sm:inline-flex"
          >
            <Link href="/contact">Book a Consultation</Link>
          </Button>

          <CartButton inverted={inverted} />

          {/* Account menu (desktop) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className={cn(
                    "hidden size-9 items-center justify-center rounded-full border transition-colors lg:flex",
                    inverted
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-border text-navy hover:bg-stone",
                  )}
                >
                  <User className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/listings">My Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sell/post">Post a Listing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={signOut}>
                    <button type="submit" className="w-full text-left text-red-600">
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className={cn(
                "hidden text-sm font-medium transition-colors lg:block",
                inverted ? "text-white/80 hover:text-white" : "text-charcoal/70 hover:text-navy",
              )}
            >
              Sign in
            </Link>
          )}

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
                <SheetClose asChild>
                  <Link
                    href="/sell"
                    className="border-b border-white/10 py-4 text-lg text-gold hover:text-gold-soft flex items-center gap-2"
                  >
                    <Tag className="size-4" /> Sell
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/marketplace"
                    className="border-b border-white/10 py-4 text-lg text-white/85 hover:text-gold"
                  >
                    Marketplace
                  </Link>
                </SheetClose>
              </nav>
              <div className="mt-auto flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="uppercase tracking-[0.2em]">Store region</span>
                  <span className="font-semibold text-gold">
                    {regionFlag[region]} {regionTagline[region]}
                  </span>
                </div>
                <SheetClose asChild>
                  <Button asChild className="bg-gold text-navy hover:bg-gold-soft">
                    <Link href="/contact">Book a Consultation</Link>
                  </Button>
                </SheetClose>
                {user ? (
                  <SheetClose asChild>
                    <Link
                      href="/account"
                      className="text-center text-sm font-medium text-white/80 hover:text-gold"
                    >
                      My Account
                    </Link>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link
                      href="/auth/login"
                      className="text-center text-sm font-medium text-white/80 hover:text-gold"
                    >
                      Sign in
                    </Link>
                  </SheetClose>
                )}
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
