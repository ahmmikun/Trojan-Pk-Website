import type { Metadata } from "next";
import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/common/button-link";
import { Checklist } from "@/components/common/checklist";
import { NumberedList } from "@/components/common/numbered-list";
import { PageHeader } from "@/components/common/page-header";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { InviteCard } from "@/components/social/invite-card";
import { joinCopy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { getInviteLinks, getSocialLink } from "@/content/social";

export const metadata: Metadata = {
  title: "Join the Community",
  description: "Apply to join Trojans PK, Pakistan's developer and open-source community. Applications are reviewed by the team.",
  alternates: { canonical: "/join" },
};

export default async function JoinPage() {
  const [invites, email] = await Promise.all([getInviteLinks(), getSocialLink("email")]);
  const formUrl = siteConfig.applicationFormUrl;

  return (
    <>
      <PageHeader
        eyebrow="Join"
        title="Become part of Trojans PK."
        description="Tell us a bit about yourself. Every application is read and reviewed by the team."
      >
        {formUrl ? (
          <ButtonLink href={formUrl} external emphasis>
            Apply now <ArrowUpRight />
            <span className="sr-only">(opens in a new tab)</span>
          </ButtonLink>
        ) : null}
      </PageHeader>

      {/* Who, what, expectations: three columns */}
      <Section bordered={false} id="apply">
        <div className="grid gap-14 md:grid-cols-3">
          {[
            { title: "Who can join", items: joinCopy.whoCanJoin },
            { title: "What members gain", items: joinCopy.whatYouGain },
            { title: "What we expect", items: joinCopy.expectations },
          ].map((col, i) => (
            <Reveal key={col.title} delay={i * 0.08}>
              <h2 className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="tabular font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                {col.title}
              </h2>
              <Checklist className="mt-6" items={col.items} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Steps */}
      <Section id="how-it-works">
        <SectionHeading eyebrow="Process" title="How participation works" />
        <NumberedList className="mt-16" ordered items={joinCopy.howItWorks.map((s) => ({ title: s.step, description: s.detail }))} />
      </Section>

      {/* Application */}
      <Section id="application">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionHeading className="lg:col-span-5" eyebrow="Application" title="Membership application" />
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <p className="text-lg leading-snug text-muted-foreground sm:text-xl">
              The application asks for: {joinCopy.applicationFields.join(", ")}. Applications are reviewed manually and are never approved automatically.
            </p>
            {formUrl ? (
              <>
                <div className="mt-8">
                  <ButtonLink href={formUrl} external emphasis>
                    Apply now <ArrowUpRight />
                    <span className="sr-only">(opens in a new tab)</span>
                  </ButtonLink>
                </div>
                <p className="mt-5 text-sm text-muted-foreground">
                  The form is hosted by a third-party service, which receives what you submit. See our{" "}
                  <Link href="/privacy" className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">Privacy Policy</Link>.
                </p>
              </>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-border p-6 text-base leading-snug text-muted-foreground">
                <p>The online application form is not open yet. In the meantime, say hello in any of our community channels below{email ? " or email us" : ""}.</p>
                {email ? (
                  <a href={email.href} className="mt-4 inline-flex items-center gap-2 text-foreground underline underline-offset-4">
                    <Mail aria-hidden="true" className="size-4" /> {email.href.replace("mailto:", "")}
                  </a>
                ) : null}
              </div>
            )}
          </Reveal>
        </div>
      </Section>

      {invites.length > 0 ? (
        <Section id="channels">
          <SectionHeading eyebrow="Communication platforms" title="Where the community talks" description="You can join our channels at any time, whether or not your application has been reviewed." />
          <Stagger as="div" className="mt-16 grid gap-5 md:grid-cols-3">
            {invites.map((l) => (
              <StaggerItem as="div" key={l.id}><InviteCard link={l} /></StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  );
}
