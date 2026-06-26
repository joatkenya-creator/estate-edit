import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: payments } = await supabase
    .from("listing_payments")
    .select(`
      id, transaction_type, amount, currency, status, created_at, paid_at,
      mpesa_transaction_id,
      user_listings ( title )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const TYPE_LABELS = { listing_fee: "Listing Fee", commission: "Commission" };
  const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    completed: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl text-navy">Payments</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Listing fees and commission payments for your marketplace activity
        </p>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <CreditCard className="mx-auto mb-4 size-10 text-charcoal/30" />
          <p className="font-medium text-navy">No payment records yet</p>
          <p className="mt-1 text-sm text-charcoal/60">
            Payments will appear here once you start selling.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                  Description
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                  Amount
                </th>
                <th className="hidden px-6 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal/40 sm:table-cell">
                  M-Pesa Ref
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                  Status
                </th>
                <th className="hidden px-6 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal/40 md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => {
                const listing = Array.isArray(payment.user_listings)
                  ? payment.user_listings[0]
                  : payment.user_listings;
                return (
                  <tr key={payment.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">
                        {TYPE_LABELS[payment.transaction_type as keyof typeof TYPE_LABELS] ?? payment.transaction_type}
                      </p>
                      {listing && (
                        <p className="text-xs text-charcoal/50 line-clamp-1">
                          {(listing as { title?: string })?.title}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-navy">
                      KES {Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="hidden px-6 py-4 text-xs text-charcoal/50 sm:table-cell">
                      {payment.mpesa_transaction_id ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          STATUS_STYLES[payment.status] ?? "bg-stone text-charcoal/60"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-xs text-charcoal/50 md:table-cell">
                      {new Date(payment.created_at).toLocaleDateString("en-KE")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
