import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getSocialLinks } from "@/content/social";

/**
 * The public site frame: the real navbar, main landmark and footer. Used by the site layout
 * and by the global 404, so every public page shares one navigation.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
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
