import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { ProjectCard } from "@/features/projects/project-card";
import { ProjectExplorer } from "@/features/projects/project-explorer";
import { getProjects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Products and open-source work built by the Trojans PK community: AI/ML, web, mobile and developer tools.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.isFeatured);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="What we have built."
        description="Real products and open-source work from community members, across AI/ML, web, mobile and developer tools."
      />

      {featured.length > 0 ? (
        <Section bordered={false} id="featured">
          <SectionHeading eyebrow="Featured" title="Highlighted projects" />
          <Stagger className={featured.length === 1 ? "mt-16 grid" : "mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2"}>
            {featured.map((p) => (
              <StaggerItem key={p.slug}>
                <ProjectCard project={p} className={featured.length === 1 ? "[&>div:first-child]:sm:aspect-[21/9]" : undefined} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}

      <Section id="all">
        <SectionHeading eyebrow="Browse" title="All projects" />
        <div className="mt-16">
          <ProjectExplorer projects={projects} />
        </div>
      </Section>
    </>
  );
}
