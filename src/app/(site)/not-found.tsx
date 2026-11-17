import type { Metadata } from "next";
import { NotFoundContent } from "@/components/common/not-found-content";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

/** Inside the (site) layout, so the 404 has the real navbar and footer. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
