import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { BrandIcon } from "@/components/social/brand-icon";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { legalNav, mainNav, siteConfig } from "@/config/site";
import { externalLinkProps } from "@/lib/social";
import { getInviteLinks, getSocialLinks } from "@/content/social";

const linkClass = "link-underline text-base text-muted-foreground transition-colors hover:text-foreground";

/** Editorial footer: closing line and CTA, link columns, then an oversized wordmark. */
export async function Footer() {
  const [social, invites] = await Promise.all([getSocialLinks(), getInviteLinks()]);
  const email = social.find((l) => l.platform === "email");
  // Rendered at build time and refreshed with the page; the year rolls over on the next render.
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-border">
      <Container className="pt-20 sm:pt-28">
        <div className="grid gap-10 border-b border-border pb-16 lg:grid-cols-12">
          <p className="max-w-xl text-3xl leading-[1.1] font-medium tracking-tight text-balance sm:text-4xl lg:col-span-7">
            A Pakistan-based developer and open-source community. Learn. Build. Collaborate. Innovate.
          </p>
          <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9 lg:items-end">
            <Link
              href="/join"
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground py-1.5 pr-1.5 pl-6 text-[15px] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Join Community
              <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-background text-foreground">
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
            <SocialIconLinks links={social} aria-label="Follow Trojans PK" />
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-3">
          <nav aria-label="Footer">
            <h2 className="text-sm text-muted-foreground">Explore</h2>
            <ul className="mt-6 space-y-3">
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
            <h2 className="text-sm text-muted-foreground">Join the conversation</h2>
            {invites.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {invites.map((l) => (
                  <li key={l.id}>
                    <a href={l.href} {...externalLinkProps(l.external)} className="group inline-flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-foreground">
                      <BrandIcon icon={l.icon} className="size-4" />
                      <span className="link-underline">{l.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-base text-muted-foreground">Invitation links are coming soon.</p>
            )}
          </div>

          <div>
            <h2 className="text-sm text-muted-foreground">Contact</h2>
            <ul className="mt-6 space-y-3">
              {email ? (
                <li>
                  <a href={email.href} className={linkClass}>{email.href.replace("mailto:", "")}</a>
                </li>
              ) : null}
              <li className="text-base text-muted-foreground">Pakistan</li>
              <li>
                <Link href="/join" className={linkClass}>Apply for membership</Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Oversized wordmark. Decorative SVG: the site name is already in the header and copyright line. */}
      <div aria-hidden="true" className="select-none px-3 sm:px-5">
        <svg viewBox="0 0 1000 205" className="block h-auto w-full text-foreground/[0.07]" role="presentation" focusable="false">
          <text
            x="500"
            y="190"
            textAnchor="middle"
            textLength="990"
            lengthAdjust="spacingAndGlyphs"
            fill="currentColor"
            style={{ font: "500 250px var(--font-sans)", letterSpacing: "-0.06em" }}
          >
            Trojans
          </text>
        </svg>
      </div>

      <Container className="flex flex-col gap-4 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <ul className="flex gap-6">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
