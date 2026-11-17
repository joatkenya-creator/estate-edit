import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Estate Edit account.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "";
  const selling = next.startsWith("/sell");
  const expired = params.reason === "expired";

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone px-4 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6">
            <Image
              src="/logo-mark.svg"
              alt="The Estate Edit"
              width={48}
              height={42}
              unoptimized
              className="h-10 w-auto"
            />
          </Link>
          <h1 className="font-display text-3xl text-navy">
            {selling && !expired ? "Sign in to post a listing" : "Welcome back"}
          </h1>
          <p className="mt-1 text-center text-sm text-charcoal/60 text-pretty">
            {selling && !expired
              ? "We need to know who the seller is so buyers can contact you and we can vet listings."
              : "Sign in to manage your account and listings"}
          </p>
        </div>

        {expired && (
          <p role="status" className="mb-5 rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
            {selling
              ? "You were signed out after a period of inactivity. Your listing draft was saved. Sign in to pick up where you left off."
              : "You were signed out after a period of inactivity. Sign in to pick up where you left off."}
          </p>
        )}

        {params.error === "callback_failed" && (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            The confirmation link has expired or is invalid. Please try signing in again.
          </p>
        )}

        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <LoginForm next={params.next} />
        </div>

        {(selling || next.startsWith("/account")) && (
          <p className="mt-6 text-center text-sm">
            <Link href="/marketplace" className="text-navy underline-offset-4 hover:underline">
              Back to Marketplace
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
