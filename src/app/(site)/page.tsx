import type { Metadata } from "next";
import { JsonLd } from "@/components/common/json-ld";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/content/site-content";
import { AchievementSection } from "@/features/achievement/achievement-section";
import { Hero } from "@/features/home/hero";
import {
  CommunityImpact,
  EventsPreview,
  FeaturedProjects,
  FinalCta,
  Introduction,
  TeamPreview,
  Testimonials,
  WhatWeDo,
} from "@/features/home/sections";
import { getFeaturedAchievement, getPartners } from "@/content/site-content";
import { PartnersSection } from "@/features/partners/partners-section";
import { getSocialLinks } from "@/content/social";

export async function generateMetadata(): Promise<Metadata> {
  const { description, defaultOgImage } = await getSiteSettings();
  return {
    title: { absolute: `${siteConfig.name} | Developer & Open-Source Community in Pakistan` },
    description,
    alternates: { canonical: "/" },
    ...(defaultOgImage ? { openGraph: { images: [defaultOgImage] }, twitter: { images: [defaultOgImage] } } : {}),
  };
}

/**
 * Section order follows the visitor's questions, alternating text-led and
 * image-led sections so the pace keeps changing:
 *   1. Hero            hook: who this is for                     (type)
 *   2. What we do      reward: what you would actually do here   (imagery, interactive)
 *   3. Introduction    why us: what makes the community different (calm text)
 *   3b. Collaborations proof by association: who we have worked with (marquee)
 *   4. Achievement     proof: we ship and compete                (feature)
 *   5. Impact          proof in numbers, only when real stats exist
 *   6. Projects        more work, minus the one already featured above
 *   7. Events          what is happening, upcoming first         (imagery)
 *   8. Team            the people you would meet                 (portraits)
 *   9. Testimonials    member voices, only when they exist
 *  10. Final CTA       the ask, once trust is built
 */
export default async function HomePage() {
  const [achievement, social, partners] = await Promise.all([getFeaturedAchievement(), getSocialLinks(), getPartners()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          logo: `${siteConfig.url}/brand/mark.png`,
          description: siteConfig.description,
          sameAs: social.filter((l) => l.external).map((l) => l.href),
        }}
      />
      <Hero />
      <WhatWeDo />
      <Introduction />
      <PartnersSection partners={partners} />
      {achievement ? <AchievementSection achievement={achievement} /> : null}
      <CommunityImpact />
      <FeaturedProjects excludeSlug={achievement?.projectSlug ?? null} />
      <EventsPreview />
      <TeamPreview />
      <Testimonials />
      <FinalCta />
    </>
  );
}
