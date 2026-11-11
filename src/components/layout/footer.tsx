import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Container } from "@/components/common/container";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { legalNav, mainNav, siteConfig } from "@/config/site";
import { externalLinkProps } from "@/lib/social";
import { getInviteLinks, getSocialLinks } from "@/content/social";
import { BrandIcon } from "@/components/social/brand-icon";

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-foreground";

export async function Footer() {
  const [social, invites] = await Promise.all([getSocialLinks(), getInviteLinks()]);
  const email = social.find((l) => l.platform === "email");
  // Evaluated once at build time (static site); the year updates on each deploy.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <Container size="wide" className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              A Pakistan-based developer and open-source community. Learn. Build. Collaborate. Innovate.
            </p>
            <SocialIconLinks links={social} className="mt-6" aria-label="Follow Trojans PK" />
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">Explore</h2>
            <ul className="mt-5 space-y-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/join" className={linkClass}>Join Community</Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">Join the conversation</h2>
            {invites.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {invites.map((l) => (
                  <li key={l.id}>
                    <a href={l.href} {...externalLinkProps(l.external)} className={`${linkClass} inline-flex items-center gap-2`}>
                      <BrandIcon icon={l.icon} className="size-3.5" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Invitation links are coming soon.</p>
            )}
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">Contact</h2>
            <ul className="mt-5 space-y-3">
              {email ? (
                <li>
                  <a href={email.href} className={linkClass}>{email.href.replace("mailto:", "")}</a>
                </li>
              ) : null}
              <li className={linkClass}>Pakistan</li>
              <li>
                <Link href="/join" className={linkClass}>Apply for membership</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
