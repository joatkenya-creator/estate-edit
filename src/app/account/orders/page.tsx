import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Orders" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  dispatched: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  payment_received: "bg-green-50 text-green-700",
  returned: "bg-orange-50 text-orange-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, total, subtotal, delivery_fee, currency, created_at, items")
    .eq("email", user.email!)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl text-navy">My Orders</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          All purchases made through The Estate Edit
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto mb-4 size-10 text-charcoal/30" />
          <p className="font-medium text-navy">No orders yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Browse our collection to find something you love.
          </p>
          <Link
            href="/collection"
            className="mt-4 inline-block text-sm font-medium text-navy hover:underline"
          >
            Browse the collection &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-charcoal/40">Order</p>
                    <p className="font-semibold text-navy">{order.order_number}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest text-charcoal/40">Date</p>
                    <p className="text-sm text-navy">
                      {new Date(order.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-charcoal/40">Total</p>
                    <p className="font-semibold text-navy">
                      KES {Number(order.total ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      STATUS_STYLES[order.status] ?? "bg-stone text-charcoal/60"
                    }`}
                  >
                    {order.status?.replace(/_/g, " ")}
                  </span>
                </div>

                {items.length > 0 && (
                  <ul className="divide-y divide-border px-6">
                    {(items as unknown as Record<string, unknown>[]).map((item, i) => (
                      <li key={i} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-navy line-clamp-1">
                            {String(item.title ?? item.name ?? "Item")}
                          </p>
                          {item.quantity != null && (
                            <p className="text-xs text-charcoal/50">Qty: {String(item.quantity)}</p>
                          )}
                        </div>
                        <p className="text-sm text-navy">
                          KES {Number(item.price ?? 0).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-between border-t border-border px-6 py-3 text-xs text-charcoal/50">
                  <span>Delivery: KES {Number(order.delivery_fee ?? 0).toLocaleString()}</span>
                  <span className={`font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    Payment: {order.payment_status ?? "unpaid"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
