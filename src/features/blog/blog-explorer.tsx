"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FilterGroup, ResultCount, SearchField } from "@/components/common/filter-bar";
import { Button } from "@/components/ui/button";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/content";
import { PostCard } from "./post-card";

const PAGE_SIZE = 9;
const isCategory = (v: string | null): v is BlogPost["categorySlug"] => BLOG_CATEGORIES.some((c) => c.slug === v);

/**
 * Search and topic filter for the blog grid. The topic lives in the URL (?category=…), so
 * filtered views can be shared and the article breadcrumb can link straight to its topic.
 */
export function BlogExplorer({ posts, allPosts = posts }: { posts: BlogPost[]; allPosts?: BlogPost[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get("category");
  const [query, setQuery] = useState("");
  const [category, setCategoryState] = useState<string | null>(isCategory(initial) ? initial : null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // With a topic or search active, include the featured post too, so nothing is hidden from results.
  const source = category || query.trim() ? allPosts : posts;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((p) => {
      if (category && p.categorySlug !== category) return false;
      if (!q) return true;
      return [p.title, p.excerpt, p.authorName, ...p.tags].some((s) => s.toLowerCase().includes(q));
    });
  }, [source, query, category]);

  const setCategory = (v: string | null) => {
    setCategoryState(v);
    setVisible(PAGE_SIZE);
    const next = new URLSearchParams(params.toString());
    if (v) next.set("category", v);
    else next.delete("category");
    const s = next.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-2xl font-medium tracking-tight">{category ? BLOG_CATEGORIES.find((c) => c.slug === category)?.name : "All articles"}</h2>
          <div className="flex flex-wrap items-end gap-6">
            <SearchField value={query} onChange={(v: string) => (setQuery(v), setVisible(PAGE_SIZE))} label="Search articles" placeholder="Search articles, authors or tags" />
            <ResultCount count={filtered.length} noun="article" />
          </div>
        </div>
        <FilterGroup
          label="Filter by topic"
          value={category}
          onChange={setCategory}
          allLabel="All topics"
          options={BLOG_CATEGORIES.map((c) => ({ value: c.slug, label: c.name, count: allPosts.filter((p) => p.categorySlug === c.slug).length }))}
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
          title={allPosts.length === 0 ? "No articles published yet" : posts.length === 0 && !category && !query ? "More articles soon" : "No articles match your filters"}
          description={allPosts.length === 0 ? "Tutorials, hackathon stories and community announcements will be published here." : posts.length === 0 && !category && !query ? "The latest article is featured above." : "Try a different search term or topic."}
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
