import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { Checklist } from "@/components/common/checklist";
import { EmptyState } from "@/components/common/empty-state";
import { JsonLd } from "@/components/common/json-ld";
import { NumberedList } from "@/components/common/numbered-list";
import { PageHeader } from "@/components/common/page-header";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { InviteCard } from "@/components/social/invite-card";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  collaborationOpportunities,
  communityBenefits,
  faqs,
  guidelines,
  interestGroups,
  openSourceOpportunities,
} from "@/config/copy";
import { FinalCta } from "@/features/home/sections";
import { getInviteLinks, getProfileLinks } from "@/content/social";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the Trojans PK community on WhatsApp, Discord and Telegram. Explore interest groups, open-source opportunities and community guidelines.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const [invites, profiles] = await Promise.all([getInviteLinks(), getProfileLinks()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <PageHeader
        eyebrow="Community"
        title="Find your people. Build together."
        description="Trojans PK is where developers, students and designers across Pakistan ask questions, share work and team up on real projects."
      >
        <ButtonLink href="/join" emphasis>Apply for membership <ArrowRight /></ButtonLink>
      </PageHeader>

      <Section bordered={false} id="join-channels">
        <SectionHeading eyebrow="Join the conversation" title="Pick your platform" description="Join any or all of our community channels." />
        {invites.length > 0 ? (
          <Stagger as="div" className="mt-16 grid gap-5 md:grid-cols-3">
            {invites.map((l) => (
              <StaggerItem as="div" key={l.id}><InviteCard link={l} /></StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState className="mt-16" title="Community channels are being set up" description="Invitation links will appear here once they are configured." />
        )}
        {profiles.length > 0 ? (
          <Reveal className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Also find us on</span>
            <SocialIconLinks links={profiles} aria-label="Trojans PK profiles" />
          </Reveal>
        ) : null}
      </Section>

      <Section id="why-join">
        <SectionHeading eyebrow="Why join" title="What membership gives you" />
        <NumberedList className="mt-16" variant="grid" columns={4} items={communityBenefits} />
      </Section>

      <Section id="interest-groups">
        <SectionHeading eyebrow="Technical interest groups" title="Learn alongside people with the same focus" />
        <NumberedList className="mt-16" items={interestGroups} />
      </Section>

      <Section id="opportunities">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Collaboration" title="Work with other members" />
            <Reveal className="mt-10"><Checklist items={collaborationOpportunities} /></Reveal>
          </div>
          <div>
            <SectionHeading eyebrow="Open source" title="Contribute to real repositories" />
            <Reveal className="mt-10"><Checklist items={openSourceOpportunities} /></Reveal>
          </div>
        </div>
      </Section>

      <Section id="guidelines">
        <SectionHeading eyebrow="Community guidelines" title="How we treat each other" />
        <NumberedList className="mt-16" variant="grid" columns={2} ordered items={guidelines} />
      </Section>

      <Section id="faq">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionHeading className="lg:col-span-4" eyebrow="FAQ" title="Frequently asked questions" />
          <Reveal className="lg:col-span-7 lg:col-start-6">
            <Accordion className="border-t border-border">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-b border-border">
                  <AccordionTrigger className="py-6 text-lg font-medium tracking-tight hover:no-underline sm:text-xl">{f.q}</AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-snug text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
