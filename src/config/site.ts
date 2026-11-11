/**
 * Static site identity and general settings. Everything on the site is
 * generated from files in this repository (no backend or database):
 *   - this file             site name, URL, application form link
 *   - src/config/social-links.ts   social + community links
 *   - src/data/*.ts         projects, events, team, achievements, stats, testimonials
 *   - content/blog/*.md     blog articles
 * See CONTENT.md for how to edit each one.
 */
import { SITE_URL } from "./site-url";

export const siteConfig = {
  name: "Trojans PK",
  shortName: "Trojans",
  tagline: "Learn. Build. Collaborate. Innovate.",
  description:
    "Trojans PK is a Pakistan-based developer, technology and open-source community where builders learn together, ship real products and grow through collaboration.",
  url: SITE_URL,
  locale: "en_PK",
  ogImage: "/brand/logo-full.png",
  /**
   * Membership applications are collected by an external form (the site has no
   * backend). Paste the form link here, e.g. a Google Form URL. While null, the
   * Join page hides the Apply button and points visitors to the community channels.
   */
  applicationFormUrl: null as string | null,
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const mainNav: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Community", href: "/community" },
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Blog", href: "/blog" },
] as const;

export const joinCta: NavItem = { label: "Join Community", href: "/join" };

export const legalNav: readonly NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;
