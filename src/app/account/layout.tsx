import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: { default: "My Account", template: "%s · Account · The Estate Edit" },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/account");

  return (
    <div className="min-h-screen bg-stone">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-charcoal/40">
                Account
              </p>
              <AccountNav />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
