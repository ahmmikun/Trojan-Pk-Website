import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/common/button-link";
import { Chip } from "@/components/common/chip";
import { Container } from "@/components/common/container";
import { DetailAside, DetailHeader } from "@/components/common/detail-header";
import { JsonLd } from "@/components/common/json-ld";
import { Markdown } from "@/components/common/markdown";
import { Section, SectionHeading } from "@/components/common/section";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { BrandIcon } from "@/components/social/brand-icon";
import { siteConfig } from "@/config/site";
import { ProjectCard } from "@/features/projects/project-card";
import { formatDate } from "@/lib/format";
import { getCategoryName, getProjectBySlug, getProjects, getRelatedProjects } from "@/content/projects";
import { PROJECT_STATUS_LABEL } from "@/types/content";

// Known slugs are prerendered at build time. Others render on demand; notFound() handles unknown ones.
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article", url: `/projects/${project.slug}`, images: project.coverImage ? [project.coverImage] : undefined },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProjects(project);
  const category = getCategoryName(project.categorySlug);
  const published = formatDate(project.publishedAt);

  const meta: { label: string; value: React.ReactNode }[] = [
    { label: "Category", value: category },
    ...(project.status ? [{ label: "Status", value: PROJECT_STATUS_LABEL[project.status] }] : []),
    ...(published && project.publishedAt ? [{ label: "Published", value: <time dateTime={project.publishedAt.toISOString().slice(0, 10)}>{published}</time> }] : []),
    ...(project.contributors.length > 0
      ? [{
          label: "Contributors",
          value: project.contributors.map((c, i) => (
            <span key={c.name}>
              {i > 0 ? ", " : ""}
              {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">{c.name}</a> : c.name}
            </span>
          )),
        }]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: project.title,
          description: project.summary,
          url: `${siteConfig.url}/projects/${project.slug}`,
          ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
          ...(project.publishedAt ? { datePublished: project.publishedAt.toISOString() } : {}),
          publisher: { "@type": "Organization", name: siteConfig.name },
        }}
      />
      <DetailHeader
        back={{ href: "/projects", label: "All projects" }}
        meta={
          <>
            <span>{category}</span>
            {project.badge ? <Chip tone="accent">{project.badge}</Chip> : null}
          </>
        }
        title={project.title}
        summary={project.summary}
        actions={
          project.githubUrl || project.liveUrl ? (
            <>
              {project.liveUrl ? <ButtonLink href={project.liveUrl} external emphasis><Globe /> Live demo</ButtonLink> : null}
              {project.githubUrl ? (
                <ButtonLink href={project.githubUrl} external variant="outline"><BrandIcon icon="github" className="size-4" /> GitHub repository</ButtonLink>
              ) : null}
            </>
          ) : undefined
        }
        cover={{ src: project.coverImage, title: project.title, label: category }}
      />

      <Container className="grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Markdown className="text-lg leading-[1.6]">{project.content}</Markdown>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <DetailAside label="Project details" items={meta}>
            {project.technologies.length > 0 ? (
              <div className="mt-8">
                <h2 className="text-sm text-muted-foreground">Technologies</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <li key={t}><Chip>{t}</Chip></li>
                  ))}
                </ul>
              </div>
            ) : null}
          </DetailAside>
        </div>
      </Container>

      {related.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Related" title="More in this category" />
          <Stagger className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <StaggerItem key={p.slug}><ProjectCard project={p} /></StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  );
}
