import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Section, SectionHeading } from "@/components/common/section";
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
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <li key={p.slug}><ProjectCard project={p} /></li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="all" className="bg-surface">
        <SectionHeading eyebrow="Browse" title="All projects" />
        <div className="mt-10">
          <ProjectExplorer projects={projects} />
        </div>
      </Section>
    </>
  );
}
