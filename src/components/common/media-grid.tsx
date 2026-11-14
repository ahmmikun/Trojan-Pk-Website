import Link from "next/link";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { cn } from "@/lib/utils";

export type MediaItem = {
  href: string;
  title: string;
  /** Second line under the title, e.g. the event type. */
  subtitle?: string | null;
  /** Shown on the right, e.g. "2026". */
  meta?: string | null;
  image: string | null;
  /** Short status shown on the tile, e.g. "Upcoming". */
  badge?: string | null;
};

/**
 * Editorial media grid: rows of 2 wide tiles, then 3 tall tiles, repeating.
 * A single item spans the full width.
 */
export function MediaGrid({ items, className, priorityFirst = false }: { items: MediaItem[]; className?: string; priorityFirst?: boolean }) {
  const single = items.length === 1;
  return (
    <Stagger className={cn("grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-6", className)}>
      {items.map((item, i) => {
        const wide = single || i % 5 < 2;
        return (
          <StaggerItem key={item.href} className={cn(single ? "sm:col-span-2 lg:col-span-6" : wide ? "lg:col-span-3" : "lg:col-span-2")}>
            <MediaTile
              item={item}
              index={i}
              aspect={single ? "aspect-[4/5] sm:aspect-[21/9]" : wide ? "aspect-[4/5] sm:aspect-[16/10]" : "aspect-[4/5]"}
              sizes={single ? "100vw" : wide ? "(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
              priority={priorityFirst && i === 0}
            />
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

function MediaTile({ item, index, aspect, sizes, priority }: { item: MediaItem; index: number; aspect: string; sizes: string; priority: boolean }) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <article className="group relative">
      <div className={cn("relative overflow-hidden rounded-md bg-surface-2", aspect)}>
        {item.image ? (
          <>
            <ParallaxImage
              src={item.image}
              alt=""
              sizes={sizes}
              priority={priority}
              className="transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.04]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/40" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,color-mix(in_srgb,var(--foreground)_9%,transparent),transparent_60%),radial-gradient(90%_70%_at_100%_100%,color-mix(in_srgb,var(--brand-blue)_18%,transparent),transparent_70%)] transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.04]"
          />
        )}

        {/* Title over the media, like a cover lockup. Decorative: the real title is the link below. */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center p-8">
          <span
            className={cn(
              "max-w-[16ch] text-center text-3xl leading-none font-medium tracking-tighter transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03] sm:text-4xl",
              item.image ? "text-white drop-shadow-[0_2px_20px_rgb(0_0_0/0.45)]" : "text-foreground/90",
            )}
          >
            {item.title}
          </span>
        </div>

        {item.badge ? (
          <span className="absolute top-4 left-4 rounded-full bg-background/80 px-2.5 py-1 text-xs text-foreground backdrop-blur-md">{item.badge}</span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-start gap-x-4 text-sm">
        <span aria-hidden="true" className="font-mono text-xs leading-5 text-foreground">[ {number} ]</span>
        <div className="min-w-0">
          <h3 className="truncate text-sm leading-5 font-medium tracking-normal">
            <Link href={item.href} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-ring">
              {item.title}
            </Link>
          </h3>
          {item.subtitle ? <p className="leading-5 text-muted-foreground">{item.subtitle}</p> : null}
        </div>
        {item.meta ? <span className="font-mono text-xs leading-5 text-foreground">{item.meta}</span> : null}
      </div>
    </article>
  );
}
