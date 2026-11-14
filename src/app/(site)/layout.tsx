import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getSocialLinks } from "@/content/social";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const socialLinks = await getSocialLinks();
  return (
    <>
      <Navbar socialLinks={socialLinks} />
      <main id="main" className="flex-1 pt-[var(--nav-h)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
