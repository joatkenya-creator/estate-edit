import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, Tag, ArrowRight, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function AccountDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileResult, ordersResult, listingsResult] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("id, order_number, status, total, currency, created_at")
      .eq("email", user.email!)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_listings")
      .select("id, title, status, price, currency, views, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const profile = profileResult.data;
  const orders = ordersResult.data ?? [];
  const listings = listingsResult.data ?? [];
  const freeUsed = profile?.free_listings_used ?? 0;
  const isPaidTier = freeUsed >= 2;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl text-navy">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">{user.email}</p>

        {/* Tier badge */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5">
          <Star className="size-3.5 text-gold" />
          <span className="text-xs font-medium text-gold-dark">
            {isPaidTier
              ? "Verified Seller — Paid Tier"
              : `Free Tier — ${2 - freeUsed} free listing${2 - freeUsed === 1 ? "" : "s"} remaining`}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total orders", value: orders.length, href: "/account/orders" },
          { label: "Active listings", value: listings.filter((l) => l.status === "active").length, href: "/account/listings" },
          { label: "Items sold", value: listings.filter((l) => l.status === "sold").length, href: "/account/listings" },
        ].map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-semibold text-navy">{value}</p>
            <p className="mt-1 text-sm text-charcoal/60">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-navy" />
            <h2 className="font-semibold text-navy">Recent orders</h2>
          </div>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs text-gold hover:underline">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-charcoal/50">
            No orders yet.{" "}
            <Link href="/collection" className="text-navy hover:underline">Browse the collection</Link>
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-navy">{order.order_number}</p>
                  <p className="text-xs text-charcoal/50">
                    {new Date(order.created_at).toLocaleDateString("en-KE")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-navy">
                    {order.currency || "KES"} {Number(order.total ?? 0).toLocaleString()}
                  </p>
                  <span className="inline-block rounded-full bg-stone px-2 py-0.5 text-xs capitalize text-charcoal/60">
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My listings */}
      <section className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-navy" />
            <h2 className="font-semibold text-navy">My listings</h2>
          </div>
          <Link href="/account/listings" className="flex items-center gap-1 text-xs text-gold hover:underline">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-charcoal/50">You haven&apos;t listed anything yet.</p>
            <Button asChild className="mt-4 bg-navy text-white hover:bg-navy-soft">
              <Link href="/sell/post">Post your first listing</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {listings.map((listing) => (
              <li key={listing.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-navy line-clamp-1">{listing.title}</p>
                  <p className="text-xs text-charcoal/50">{listing.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-navy">
                    {listing.currency || "KES"} {Number(listing.price).toLocaleString()}
                  </p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${
                    listing.status === "active"
                      ? "bg-green-50 text-green-700"
                      : listing.status === "sold"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-stone text-charcoal/60"
                  }`}>
                    {listing.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
