import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/common/legal-page";
import { getSocialLink } from "@/content/social";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trojans PK handles information on this website and in membership applications.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const email = await getSocialLink("email");
  const contact = email ? (
    <a href={email.href}>{email.href.replace("mailto:", "")}</a>
  ) : (
    <>our community channels listed on the <Link href="/community">Community</Link> page</>
  );
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="November 2026">
      <p>Trojans PK is a volunteer developer community. This policy explains how information is handled on this website.</p>

      <h2>This website</h2>
      <p>
        This website is a static site. It has no user accounts and no database, and it does not collect or store personal information itself.
        It currently uses no advertising or analytics cookies. If that changes, this policy will be updated first.
      </p>
      <p>Like any website, the hosting provider may keep standard server logs (such as IP address and requested pages) for security and operations.</p>

      <h2>Membership applications</h2>
      <p>
        Membership applications are collected through an external form hosted by a third-party service. If you apply, the details you submit
        (such as your name, email address, city and country, optional GitHub and LinkedIn profile links, technical interests, experience level and
        your reason for joining) are received by that service and by the community team, who use them only to review your application and contact you about it.
      </p>

      <h2>Third-party services and links</h2>
      <p>
        This site links to services such as WhatsApp, Discord, Telegram, GitHub, LinkedIn and Instagram. Those services have their own privacy practices
        that apply once you leave our site. Article share buttons open each platform&apos;s own share page; nothing is sent to them until you click.
      </p>

      <h2>Sharing</h2>
      <p>We do not sell your personal information.</p>

      <h2>Your choices</h2>
      <p>You can ask to access, correct or delete information you submitted in a membership application by contacting us through {contact}.</p>

      <h2>Changes</h2>
      <p>We may update this policy as the community evolves. The date above shows when it was last changed.</p>
    </LegalPage>
  );
}
