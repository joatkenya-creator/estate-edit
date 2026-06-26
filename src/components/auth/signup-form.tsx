"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { status: "idle", message: "" };

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-green-600" />
        <p className="font-medium text-green-800">{state.message}</p>
        <p className="mt-2 text-sm text-green-700">
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Jane Kamau"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          minLength={8}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-navy text-white hover:bg-navy-soft"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-charcoal/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-navy hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-charcoal/40">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="hover:underline">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}
