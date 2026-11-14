import type { Metadata } from "next";
import { ArrowUpRight, Check, Mail } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/common/button-link";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
import { InviteCard } from "@/components/social/invite-card";
import { joinCopy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { getInviteLinks, getSocialLink } from "@/content/social";

export const metadata: Metadata = {
  title: "Join the Community",
  description: "Apply to join Trojans PK, Pakistan's developer and open-source community. Applications are reviewed by the team.",
  alternates: { canonical: "/join" },
};

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs text-muted-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-sm text-muted-foreground">
            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-blue" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function JoinPage() {
  const [invites, email] = await Promise.all([getInviteLinks(), getSocialLink("email")]);
  const formUrl = siteConfig.applicationFormUrl;

  return (
    <>
      <PageHeader
        eyebrow="Join"
        title="Become part of Trojans PK."
        description="Tell us a bit about yourself. Every application is read and reviewed by the team."
      />

      <Section bordered={false} id="apply">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-5">
            <List title="Who can join" items={joinCopy.whoCanJoin} />
            <List title="What members gain" items={joinCopy.whatYouGain} />
            <List title="What we expect" items={joinCopy.expectations} />
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">How participation works</h2>
              <ol className="mt-6 space-y-5">
                {joinCopy.howItWorks.map((s, i) => (
                  <li key={s.step} className="flex gap-4">
                    <span className="text-sm text-brand-blue">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-sm font-medium">{s.step}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">Membership application</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The application asks for: {joinCopy.applicationFields.join(", ")}. Applications are reviewed manually and are never approved automatically.
              </p>
              {formUrl ? (
                <>
                  <div className="mt-6">
                    <ButtonLink href={formUrl} external emphasis>
                      Apply now <ArrowUpRight />
                      <span className="sr-only">(opens in a new tab)</span>
                    </ButtonLink>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    The form is hosted by a third-party service, which receives what you submit. See our{" "}
                    <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
                  </p>
                </>
              ) : (
                <div className="mt-6 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <p>The online application form is not open yet. In the meantime, say hello in any of our community channels below{email ? " or email us" : ""}.</p>
                  {email ? (
                    <a href={email.href} className="mt-3 inline-flex items-center gap-2 text-foreground underline underline-offset-4">
                      <Mail aria-hidden="true" className="size-4" /> {email.href.replace("mailto:", "")}
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {invites.length > 0 ? (
        <Section id="channels" className="bg-surface">
          <SectionHeading eyebrow="Communication platforms" title="Where the community talks" description="You can join our channels at any time, whether or not your application has been reviewed." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {invites.map((l) => (
              <InviteCard key={l.id} link={l} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
