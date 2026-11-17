import { notFound } from "next/navigation";
import { DEVELOPMENTS_LIVE } from "@/lib/site";

// Not launched yet: 404 the whole section until DEVELOPMENTS_LIVE is flipped
// (after Kings resolves brief 2.5 and signs off every page).
export default function Layout({ children }: { children: React.ReactNode }) {
  if (!DEVELOPMENTS_LIVE) notFound();
  return children;
}
