import type { Metadata } from "next";
import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/common/button-link";
import { Chip } from "@/components/common/chip";
import { Container } from "@/components/common/container";
import { Cover } from "@/components/common/cover";
import { JsonLd } from "@/components/common/json-ld";
import { Markdown } from "@/components/common/markdown";
import { Section, SectionHeading } from "@/components/common/section";
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
      <Container className="pt-10">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> All projects
        </Link>
      </Container>

      <Container className="py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{category}</Chip>
          {project.badge ? <Chip tone="accent">{project.badge}</Chip> : null}
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{project.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{project.summary}</p>
        {project.githubUrl || project.liveUrl ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.liveUrl ? (
              <ButtonLink href={project.liveUrl} external emphasis><Globe /> Live demo</ButtonLink>
            ) : null}
            {project.githubUrl ? (
              <ButtonLink href={project.githubUrl} external variant="outline"><BrandIcon icon="github" className="size-4" /> GitHub repository</ButtonLink>
            ) : null}
          </div>
        ) : null}
        <Cover src={project.coverImage} title={project.title} label={category} priority sizes="(min-width: 1152px) 1100px, 100vw" className="mt-12 rounded-lg border border-border sm:aspect-[21/9]" />
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Markdown>{project.content}</Markdown>
        </div>
        <aside className="lg:col-span-4" aria-label="Project details">
          <dl className="divide-y divide-border rounded-lg border border-border bg-surface">
            {meta.map((m) => (
              <div key={m.label} className="flex justify-between gap-4 px-5 py-4 text-sm">
                <dt className="text-muted-foreground">{m.label}</dt>
                <dd className="text-right">{m.value}</dd>
              </div>
            ))}
          </dl>
          {project.technologies.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xs text-muted-foreground">Technologies</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <li key={t}><Chip>{t}</Chip></li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </Container>

      {related.length > 0 ? (
        <Section className="bg-surface">
          <SectionHeading eyebrow="Related" title="More in this category" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}><ProjectCard project={p} /></li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
