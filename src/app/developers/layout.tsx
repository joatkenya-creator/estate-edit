import { notFound } from "next/navigation";
import { RESIDENCES_LIVE } from "@/lib/site";

// Not launched yet: 404 the whole section until RESIDENCES_LIVE is flipped.
export default function Layout({ children }: { children: React.ReactNode }) {
  if (!RESIDENCES_LIVE) notFound();
  return children;
}
