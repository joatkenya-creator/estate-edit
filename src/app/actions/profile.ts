"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in to update your profile." };
  }

  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;

  if (!fullName) {
    return { status: "error", message: "Full name is required." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName, phone, location, bio })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error.message);
    return { status: "error", message: "Failed to update profile. Please try again." };
  }

  revalidatePath("/account/profile");
  return { status: "success", message: "Profile updated successfully." };
}
