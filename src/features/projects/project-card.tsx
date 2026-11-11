import { ArrowUpRight, Globe } from "lucide-react";
import Link from "next/link";
import { Chip } from "@/components/common/chip";
import { Cover } from "@/components/common/cover";
import { BrandIcon } from "@/components/social/brand-icon";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES, type Project } from "@/types/content";

const categoryName = (slug: Project["categorySlug"]) => PROJECT_CATEGORIES.find((c) => c.slug === slug)?.name ?? "Other";

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const category = categoryName(project.categorySlug);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-white/20 hover:bg-surface-2",
        className,
      )}
    >
      <Cover src={project.coverImage} title={project.title} label={category} className="border-b border-border" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Chip>{category}</Chip>
          {project.badge ? <Chip tone="accent">{project.badge}</Chip> : null}
        </div>
        <h3 className="mt-4 text-lg font-medium tracking-tight">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-ring">
            {project.title}
            <ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
        {project.technologies.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.technologies.slice(0, 5).map((t) => (
              <li key={t}><Chip>{t}</Chip></li>
            ))}
          </ul>
        ) : null}
        {project.githubUrl || project.liveUrl ? (
          <div className="relative z-10 mt-5 flex gap-4 border-t border-border pt-4 text-sm">
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <BrandIcon icon="github" className="size-4" /> GitHub
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Globe className="size-4" aria-hidden="true" /> Live demo
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
