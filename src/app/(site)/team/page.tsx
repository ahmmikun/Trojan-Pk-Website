import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { FinalCta } from "@/features/home/sections";
import { TeamProfile } from "@/features/team/team-card";
import { getTeam } from "@/content/team";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the founder and core team leading Trojans PK, Pakistan's developer and open-source community.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="The people behind the community."
        description="Engineers and builders who started Trojans PK and keep it moving."
      />
      <Section bordered={false} className="py-0 sm:py-0">
        <div className="border-b border-border pb-px [&>article:first-child]:border-t-0">
          {team.map((m, i) => (
            <TeamProfile key={m.slug} member={m} index={i} />
          ))}
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
