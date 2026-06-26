import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, phone, bio, location")
    .eq("id", user.id)
    .single();

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h1 className="mb-1 font-display text-2xl text-navy">Profile</h1>
      <p className="mb-6 text-sm text-charcoal/60">
        Update your personal details. Your name and location are shown on your listings.
      </p>

      <div className="mb-6 rounded-lg bg-stone px-4 py-3">
        <p className="text-xs text-charcoal/60">Email address</p>
        <p className="text-sm font-medium text-navy">{user.email}</p>
        <p className="mt-0.5 text-xs text-charcoal/40">
          Email cannot be changed here. Contact support if needed.
        </p>
      </div>

      <ProfileForm
        profile={{
          full_name: profile?.full_name ?? null,
          phone: profile?.phone ?? null,
          bio: profile?.bio ?? null,
          location: profile?.location ?? null,
        }}
      />
    </div>
  );
}
