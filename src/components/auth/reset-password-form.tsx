"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { status: "idle", message: "" };

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      const t = setTimeout(() => router.push("/account"), 2000);
      return () => clearTimeout(t);
    }
  }, [state.status, router]);

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
        <Label htmlFor="password">New password</Label>
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

      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
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
            Updating password…
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
