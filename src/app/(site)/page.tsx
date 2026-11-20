import type { Metadata } from "next";
import { JsonLd } from "@/components/common/json-ld";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/content/site-content";
import { AchievementSection } from "@/features/achievement/achievement-section";
import { Hero } from "@/features/home/hero";
import {
  CommunityImpact,
  CommunityOverview,
  EventsPreview,
  FeaturedProjects,
  FinalCta,
  HomeFaq,
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
  const ogImage = defaultOgImage || `${siteConfig.url}${siteConfig.ogImage}`;
  return {
    title: { absolute: `${siteConfig.name} | Developer & Open-Source Community in Pakistan` },
    description,
    keywords: [
      "developer community",
      "open-source community",
      "software engineering community",
      "technology community Pakistan",
      "coding community",
      "AI hackathons",
      "tech mentorship",
      "Trojans PK",
    ],
    alternates: { canonical: `${siteConfig.url}/` },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: `${siteConfig.name} | Developer & Open-Source Community in Pakistan`,
      description,
      url: `${siteConfig.url}/`,
      images: [{ url: ogImage, width: 1024, height: 940, alt: `${siteConfig.name} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} | Developer & Open-Source Community in Pakistan`,
      description,
      images: [ogImage],
    },
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
          "@id": `${siteConfig.url}#organization`,
          name: siteConfig.name,
          alternateName: ["Trojans", "Trojans Pakistan"],
          url: siteConfig.url,
          logo: `${siteConfig.url}/brand/mark.png`,
          image: `${siteConfig.url}/brand/logo-full.png`,
          description: siteConfig.description,
          email: "talha@trojanspk.com",
          keywords: "Developer Community, Open-Source Community, Software Engineering Community, Tech Community Pakistan, AI Hackathons, Collaborative Coding, Tech Mentorship",
          knowsAbout: [
            "Software Development",
            "Open Source Software",
            "Artificial Intelligence",
            "Web Development",
            "Hackathons",
            "Tech Mentorship",
            "Community Building",
            "Computer Science Education",
          ],
          serviceType: "Developer and Open-Source Community",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "Community Support & Inquiries",
              email: "talha@trojanspk.com",
              url: `${siteConfig.url}/contact`,
              availableLanguage: ["English", "Urdu"],
            },
          ],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Lahore",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
          sameAs: [
            ...social.filter((l) => l.external).map((l) => l.href),
            "https://github.com/trojan-pk",
            "https://www.linkedin.com/company/trojan-pk",
          ],
        }}
      />
      <Hero />
      <CommunityOverview />
      <WhatWeDo />
      <Introduction />
      <PartnersSection partners={partners} />
      {achievement ? <AchievementSection achievement={achievement} /> : null}
      <CommunityImpact />
      <FeaturedProjects excludeSlug={achievement?.projectSlug ?? null} />
      <EventsPreview />
      <TeamPreview />
      <Testimonials />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
