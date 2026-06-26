"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { status: "idle", message: "" };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, initial);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-green-600" />
        <p className="font-medium text-green-800">{state.message}</p>
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

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-navy text-white hover:bg-navy-soft"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending reset link…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <p className="text-center text-sm text-charcoal/60">
        Remember your password?{" "}
        <Link href="/auth/login" className="font-medium text-navy hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
