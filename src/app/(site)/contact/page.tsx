import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, MessageSquare, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/common/container";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeader } from "@/components/common/page-header";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { BrandIcon } from "@/components/social/brand-icon";
import { siteConfig } from "@/config/site";
import { externalLinkProps } from "@/lib/social";
import { getInviteLinks, getSocialLinks } from "@/content/social";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Trojans PK, Pakistan's developer and open-source community. Reach out for partnerships, speaking engagements, community questions, or technical collaborations.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description:
      "Reach out to Trojans PK for partnership opportunities, hackathon collaborations, event sponsorships, and membership questions.",
    url: "/contact",
    type: "website",
  },
};

const inquiryChannels = [
  {
    icon: Mail,
    title: "Official Email",
    description: "For partnerships, event sponsorships, speaking requests, press, and general inquiries.",
    contactText: "talha@trojanspk.com",
    href: "mailto:talha@trojanspk.com",
    actionLabel: "Send an email",
    external: false,
  },
  {
    icon: MessageSquare,
    title: "Community Discussions",
    description: "For active technical discussions, quick questions, and day-to-day coordination with members.",
    contactText: "WhatsApp & Discord",
    href: "https://chat.whatsapp.com/HosYEWJuqnvEn21xO0tMqU",
    actionLabel: "Join WhatsApp",
    external: true,
  },
  {
    icon: MapPin,
    title: "Location & Base",
    description: "Trojans PK is established and coordinated across Pakistan, with primary hubs in Lahore and Islamabad.",
    contactText: "Lahore, Punjab, Pakistan",
    href: "/community",
    actionLabel: "View community hubs",
    external: false,
  },
];

const contactFaqs = [
  {
    question: "How can my company partner with or sponsor Trojans PK?",
    answer:
      "We collaborate with technology companies, developer platforms, and educational institutions on hackathons, technical workshops, DevDays, and mentorship tracks. Send an email to talha@trojanspk.com detailing your organization and proposed initiative.",
  },
  {
    question: "How do I apply for community membership?",
    answer:
      "You can submit a membership application on our Join page. Every application is reviewed manually by our team to maintain high collaboration standards and a healthy peer learning culture.",
  },
  {
    question: "Can I propose a workshop, talk, or technical session?",
    answer:
      "Yes! We regularly host technical sessions, code walkthroughs, and hackathon preparation workshops. Reach out via email or message any core team member in our Discord or WhatsApp channels with your topic outline.",
  },
  {
    question: "Where can I report a code of conduct issue?",
    answer:
      "We take community safety and inclusivity seriously. If you encounter any harassment or code of conduct violations, contact our core team directly via talha@trojanspk.com or notify an admin in our communication channels.",
  },
];

export default async function ContactPage() {
  const [social, invites] = await Promise.all([getSocialLinks(), getInviteLinks()]);
  const url = `${siteConfig.url}/contact`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": `${url}#contact`,
          name: `Contact ${siteConfig.name}`,
          description: "Official contact information and community channels for Trojans PK in Pakistan.",
          url,
          mainEntity: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            email: "talha@trojanspk.com",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Lahore",
              addressRegion: "Punjab",
              addressCountry: "PK",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Community & Partnership Support",
              email: "talha@trojanspk.com",
              url,
              availableLanguage: ["English", "Urdu"],
            },
          },
        }}
      />

      <PageHeader
        eyebrow="Contact"
        title="Let's connect and build together."
        description="Whether you have questions about joining the community, want to collaborate on open-source initiatives, or seek to sponsor a developer event in Pakistan, we'd love to hear from you."
      />

      {/* Main contact touchpoints */}
      <Section bordered={false} id="touchpoints">
        <Stagger className="grid gap-6 md:grid-cols-3">
          {inquiryChannels.map((channel) => (
            <StaggerItem key={channel.title}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-foreground/20">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-surface-2 text-foreground">
                    <channel.icon className="size-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-xl font-medium tracking-tight text-foreground">{channel.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{channel.description}</p>
                </div>
                <div className="mt-8 border-t border-border pt-6">
                  <p className="font-mono text-sm text-foreground">{channel.contactText}</p>
                  <a
                    href={channel.href}
                    {...(channel.external ? externalLinkProps(true) : {})}
                    className="link-underline mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-80"
                  >
                    <span>{channel.actionLabel}</span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Community Channels & Social Touchpoints */}
      <Section id="community-channels">
        <SectionHeading
          eyebrow="Direct Channels"
          title="Connect across our active platforms"
          description="We operate across major developer networks and community spaces. Choose the platform where you work best."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 transition-colors hover:border-foreground/25"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-foreground">
                    <BrandIcon icon={invite.icon} className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">{invite.label}</h3>
                    <span className="text-xs text-muted-foreground">Community Invite</span>
                  </div>
                </div>
                {invite.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{invite.description}</p>
                ) : null}
              </div>
              <div className="mt-6 border-t border-border pt-4">
                <a
                  href={invite.href}
                  {...externalLinkProps(invite.external)}
                  className="link-underline inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  Join Channel <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Frequently Asked Questions */}
      <Section id="faq">
        <SectionHeading
          eyebrow="Questions & Answers"
          title="Frequently asked contact inquiries"
          description="Quick answers about how we respond, partnerships, and who to contact."
        />
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {contactFaqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="text-lg font-medium text-foreground">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Engagement Note */}
      <Section id="engagement-standards" className="bg-surface">
        <Container size="narrow" className="text-center">
          <Reveal>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-foreground">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-balance text-2xl font-medium tracking-tight sm:text-3xl">
              Authentic community, transparent communication.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Trojans PK is driven by software builders, open-source contributors, and volunteers. We strive to reply to all legitimate inquiries within 48 business hours. For community membership reviews, please allow up to one week.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/join"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Apply for Membership
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
              >
                Learn About Our Mission
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
