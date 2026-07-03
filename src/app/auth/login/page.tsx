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
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

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
          <h1 className="font-display text-3xl text-navy">Welcome back</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Sign in to manage your account and listings
          </p>
        </div>

        {params.error === "callback_failed" && (
          <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            The confirmation link has expired or is invalid. Please try signing in again.
          </p>
        )}

        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <LoginForm next={params.next} />
        </div>
      </div>
    </main>
  );
}
