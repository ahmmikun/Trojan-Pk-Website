import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { IntroCurtain } from "@/components/motion/intro-curtain";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getSocialLinks } from "@/content/social";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const socialLinks = await getSocialLinks();
  return (
    <>
      {/* Public site only: /admin gets neither the opening curtain nor smooth scrolling. */}
      <IntroCurtain />
      <SmoothScroll />
      <Navbar socialLinks={socialLinks} />
      <main id="main" className="flex-1 pt-[var(--nav-h)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
