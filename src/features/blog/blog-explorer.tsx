"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterGroup, SearchField } from "@/components/common/filter-bar";
import { Button } from "@/components/ui/button";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/content";
import { PostCard } from "./post-card";

const PAGE_SIZE = 9;

export function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category && p.categorySlug !== category) return false;
      if (!q) return true;
      return [p.title, p.excerpt, p.authorName, ...p.tags].some((s) => s.toLowerCase().includes(q));
    });
  }, [posts, query, category]);

  const update = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        <SearchField value={query} onChange={update(setQuery)} label="Search articles" placeholder="Search articles, authors or tags" />
        <FilterGroup
          label="Filter by category"
          value={category}
          onChange={update(setCategory)}
          allLabel="All topics"
          options={BLOG_CATEGORIES.map((c) => ({ value: c.slug, label: c.name, count: posts.filter((p) => p.categorySlug === c.slug).length }))}
        />
      </div>

      <p className="mt-8 text-sm text-muted-foreground" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "article" : "articles"}
      </p>

      {filtered.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((p) => (
            <li key={p.slug}><PostCard post={p} /></li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-4"
          title={posts.length === 0 ? "No articles published yet" : "No articles match your filters"}
          description={posts.length === 0 ? "Tutorials, hackathon stories and community announcements will be published here." : "Try a different search term or topic."}
        />
      )}

      {filtered.length > visible ? (
        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Show more</Button>
        </div>
      ) : null}
    </div>
  );
}
