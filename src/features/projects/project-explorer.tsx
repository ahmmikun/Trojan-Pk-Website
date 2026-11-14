"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterGroup, ResultCount, SearchField } from "@/components/common/filter-bar";
import { Button } from "@/components/ui/button";
import { PROJECT_CATEGORIES, type Project } from "@/types/content";
import { ProjectCard } from "./project-card";

const PAGE_SIZE = 9;

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tech, setTech] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const technologies = useMemo(
    () => [...new Set(projects.flatMap((p) => p.technologies))].sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (category && p.categorySlug !== category) return false;
      if (tech && !p.technologies.includes(tech)) return false;
      if (!q) return true;
      return [p.title, p.summary, ...p.technologies].some((s) => s.toLowerCase().includes(q));
    });
  }, [projects, query, category, tech]);

  const reset = () => {
    setQuery("");
    setCategory(null);
    setTech(null);
  };
  const withReset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setVisible(PAGE_SIZE);
  };

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SearchField value={query} onChange={withReset(setQuery)} label="Search projects" placeholder="Search projects or technologies" />
          <ResultCount count={filtered.length} noun="project" />
        </div>
        <FilterGroup
          label="Filter by category"
          value={category}
          onChange={withReset(setCategory)}
          options={PROJECT_CATEGORIES.map((c) => ({
            value: c.slug,
            label: c.name,
            count: projects.filter((p) => p.categorySlug === c.slug).length,
          }))}
          allLabel="All categories"
        />
        {technologies.length > 0 ? (
          <FilterGroup
            label="Filter by technology"
            value={tech}
            onChange={withReset(setTech)}
            options={technologies.map((t) => ({ value: t, label: t }))}
            allLabel="All technologies"
          />
        ) : null}
      </div>

      {shown.length > 0 ? (
        <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-12"
          title={projects.length === 0 ? "No projects published yet" : "No projects match your filters"}
          description={projects.length === 0 ? "Community projects will appear here as they are published." : "Try a different search term or clear the filters."}
        >
          {projects.length > 0 ? (
            <Button variant="outline" size="lg" className="h-11 rounded-full px-5" onClick={reset}>Clear filters</Button>
          ) : null}
        </EmptyState>
      )}

      {filtered.length > visible ? (
        <div className="mt-14 flex justify-center">
          <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
