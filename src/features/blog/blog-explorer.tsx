"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterGroup, ResultCount, SearchField } from "@/components/common/filter-bar";
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
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SearchField value={query} onChange={update(setQuery)} label="Search articles" placeholder="Search articles, authors or tags" />
          <ResultCount count={filtered.length} noun="article" />
        </div>
        <FilterGroup
          label="Filter by category"
          value={category}
          onChange={update(setCategory)}
          allLabel="All topics"
          options={BLOG_CATEGORIES.map((c) => ({ value: c.slug, label: c.name, count: posts.filter((p) => p.categorySlug === c.slug).length }))}
        />
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((p) => (
            <li key={p.slug}><PostCard post={p} /></li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-12"
          title={posts.length === 0 ? "No articles published yet" : "No articles match your filters"}
          description={posts.length === 0 ? "Tutorials, hackathon stories and community announcements will be published here." : "Try a different search term or topic."}
        />
      )}

      {filtered.length > visible ? (
        <div className="mt-14 flex justify-center">
          <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Show more</Button>
        </div>
      ) : null}
    </div>
  );
}
