import { IntroCurtain } from "@/components/motion/intro-curtain";
import { SiteShell } from "@/components/layout/site-shell";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Public site only: /admin gets neither the opening curtain nor smooth scrolling. */}
      <IntroCurtain />
      <SmoothScroll />
      <SiteShell>{children}</SiteShell>
    </>
  );
}
