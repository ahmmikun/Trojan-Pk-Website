import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { EmptyState } from "@/components/common/empty-state";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
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

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i} className="flex gap-3 text-muted-foreground">
          <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

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
        <ButtonLink href="/join" emphasis>Apply for membership</ButtonLink>
      </PageHeader>

      <Section bordered={false} id="join-channels">
        <SectionHeading eyebrow="Join the conversation" title="Pick your platform" description="Join any or all of our community channels." />
        {invites.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {invites.map((l) => (
              <InviteCard key={l.id} link={l} />
            ))}
          </div>
        ) : (
          <EmptyState className="mt-12" title="Community channels are being set up" description="Invitation links will appear here once they are configured." />
        )}
        {profiles.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-xs text-muted-foreground">Also find us on</span>
            <SocialIconLinks links={profiles} aria-label="Trojans PK profiles" />
          </div>
        ) : null}
      </Section>

      <Section id="why-join" className="bg-surface">
        <SectionHeading eyebrow="Why join" title="What membership gives you" />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {communityBenefits.map((b) => (
            <li key={b.title} className="bg-background p-7">
              <b.icon aria-hidden="true" className="size-5 text-brand-blue" />
              <h3 className="mt-5 text-base font-medium tracking-tight">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="interest-groups">
        <SectionHeading eyebrow="Technical interest groups" title="Learn alongside people with the same focus" />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interestGroups.map((g) => (
            <li key={g.title} className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-foreground/20">
              <h3 className="text-base font-medium tracking-tight">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="opportunities" className="bg-surface">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Collaboration" title="Work with other members" />
            <div className="mt-8"><Checklist items={collaborationOpportunities} /></div>
          </div>
          <div>
            <SectionHeading eyebrow="Open source" title="Contribute to real repositories" />
            <div className="mt-8"><Checklist items={openSourceOpportunities} /></div>
          </div>
        </div>
      </Section>

      <Section id="guidelines">
        <SectionHeading eyebrow="Community guidelines" title="How we treat each other" />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {guidelines.map((g, i) => (
            <li key={g.title} className="bg-background p-7">
              <p className="text-xs text-brand-blue">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-base font-medium tracking-tight">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="faq" className="bg-surface" containerSize="narrow">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <Accordion className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <FinalCta />
    </>
  );
}
