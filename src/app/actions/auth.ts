"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/welcome";

export type AuthState = {
  status: "idle" | "success" | "error";
  message: string;
};

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!email || !password || !fullName || !phone) {
    return { status: "error", message: "Please fill in all required fields." };
  }
  // PhoneField submits E.164 (e.g. +254712345678); reject anything else.
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return { status: "error", message: "Please enter a valid phone number." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { status: "error", message: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Copied into user_profiles by the handle_new_user trigger.
      data: { full_name: fullName, phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://estateedit.org"}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.message?.includes("already registered")) {
      return { status: "error", message: "An account with this email already exists. Please sign in." };
    }
    if (error.status === 429) {
      return { status: "error", message: "Too many sign-up attempts. Please wait a moment before trying again." };
    }
    return { status: "error", message: error.message ?? "Sign-up failed. Please try again." };
  }

  // Fire-and-forget: a failed welcome email must never block account creation.
  void sendWelcomeEmail({ name: fullName, email, role: "Seller", createdAt: new Date(), phone });

  return {
    status: "success",
    message: "Account created! Check your email and click the confirmation link to activate your account.",
  };
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { status: "error", message: "Please enter your email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.status === 429) {
      return { status: "error", message: "Too many login attempts. Please wait a few minutes before trying again." };
    }
    if (error.message?.includes("Email not confirmed")) {
      return { status: "error", message: "Please confirm your email before signing in. Check your inbox for the confirmation link." };
    }
    return { status: "error", message: "Invalid email or password. Please try again." };
  }

  const next = formData.get("next") as string | null;
  redirect(next && next.startsWith("/") ? next : "/account");
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------
export async function forgotPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://estateedit.org"}/auth/reset-password`,
  });

  if (error) {
    if (error.status === 429) {
      return { status: "error", message: "Too many requests. Please wait a few minutes before trying again." };
    }
    console.error("Password reset error:", error.message);
  }

  // Always return success to avoid leaking whether the email exists
  return {
    status: "success",
    message: "If that email is registered, you'll receive a password reset link shortly.",
  };
}

// ---------------------------------------------------------------------------
// Reset password (after clicking email link)
// ---------------------------------------------------------------------------
export async function resetPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (!password || password.length < 8) {
    return { status: "error", message: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { status: "error", message: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { status: "error", message: error.message ?? "Failed to reset password. Please try again." };
  }

  return { status: "success", message: "Password updated successfully. Redirecting you to your account…" };
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
