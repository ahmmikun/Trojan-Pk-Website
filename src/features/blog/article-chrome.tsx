"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/markdown";

/** Thin bar under the navbar showing how far through the article the reader is. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => (frame ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetId]);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-foreground" />
    </div>
  );
}

/** Highlights the section currently on screen. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function ArticleToc({ items, className }: { items: TocItem[]; className?: string }) {
  const active = useActiveHeading(items.map((i) => i.id));
  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className={className}>
      <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">On this page</p>
      <ol className="mt-4 flex flex-col border-l border-border">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1.5 text-sm leading-snug transition-colors",
                i.depth === 3 ? "pl-7" : "pl-4",
                active === i.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Collapsible outline for screens without the side column. */
export function ArticleTocMobile({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <details className="group mb-10 rounded-2xl border border-border bg-surface open:pb-2 xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        On this page
        <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <ol className="flex flex-col px-5 pb-3">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={cn("block py-1.5 text-sm text-muted-foreground hover:text-foreground", i.depth === 3 && "pl-4")}>
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
