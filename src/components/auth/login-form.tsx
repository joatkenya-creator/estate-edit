"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type AuthState } from "@/app/actions/auth";
import { validateSignIn } from "@/lib/validation";
import {
  FieldError,
  FormAlert,
  useFieldErrors,
  useOnline,
  useSubmit,
} from "@/components/states/form-states";

const initial: AuthState = { status: "idle", message: "" };

export function LoginForm({ next }: { next?: string }) {
  const [state, submit, pending] = useSubmit(signIn, initial);
  const v = useFieldErrors(validateSignIn);
  const online = useOnline();

  useEffect(() => {
    if (state.status === "error") v.showErrors(state.fieldErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      {...v.formProps}
      onSubmit={(e) => {
        e.preventDefault();
        if (v.validateAll(e.currentTarget)) submit(new FormData(e.currentTarget));
      }}
      className="space-y-5"
    >
      {next && <input type="hidden" name="next" value={next} />}

      {state.status === "error" && !state.fieldErrors && <FormAlert>{state.message}</FormAlert>}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...v.a11y("email")}
        />
        <FieldError name="email" message={v.errors.email} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-gold hover:text-gold-soft hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...v.a11y("password")}
        />
        <FieldError name="password" message={v.errors.password} />
      </div>

      <Button
        type="submit"
        disabled={pending || !online}
        className="h-10 w-full bg-navy text-white hover:bg-navy-soft"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      {!online && (
        <p role="status" className="text-center text-xs text-charcoal/60">
          You&apos;re offline. Sign in needs a connection, so try again once you&apos;re back online.
        </p>
      )}

      <p className="text-center text-sm text-charcoal/60">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-navy hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
