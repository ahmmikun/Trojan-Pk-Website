import type { Metadata } from "next";
import { NotFoundContent } from "@/components/common/not-found-content";
import { SiteShell } from "@/components/layout/site-shell";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

/**
 * 404 for URLs that match no route. It renders outside the (site) layout, so it brings the same
 * frame itself: the real navbar, footer and smooth scrolling (no opening curtain on an error page).
 * Missing items inside existing routes (e.g. /events/unknown) use app/(site)/not-found.tsx instead.
 */
export default function RootNotFound() {
  return (
    <>
      <SmoothScroll />
      <SiteShell>
        <NotFoundContent />
      </SiteShell>
    </>
  );
}
