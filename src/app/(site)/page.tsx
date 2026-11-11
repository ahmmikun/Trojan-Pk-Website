import type { Metadata } from "next";
import { JsonLd } from "@/components/common/json-ld";
import { siteConfig } from "@/config/site";
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
import { getFeaturedAchievement } from "@/content/site-content";
import { getSocialLinks } from "@/content/social";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} | Developer & Open-Source Community in Pakistan` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [achievement, social] = await Promise.all([getFeaturedAchievement(), getSocialLinks()]);

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
      <Introduction />
      <WhatWeDo />
      <CommunityImpact />
      <FeaturedProjects />
      {achievement ? <AchievementSection achievement={achievement} /> : null}
      <EventsPreview />
      <TeamPreview />
      <Testimonials />
      <FinalCta />
    </>
  );
}
