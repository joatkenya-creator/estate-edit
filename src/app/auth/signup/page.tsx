import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Estate Edit account to post and sell items.",
  robots: { index: false },
};

export default function SignUpPage() {
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
          <h1 className="font-display text-3xl text-navy">Create an account</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            List your first two items for free
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
