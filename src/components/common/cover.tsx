import { HoverFrame } from "@/components/motion/hover-frame";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  title: string;
  /** Small label printed on generated covers, e.g. the category. */
  label?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Text on the hover cursor disc; null for covers that aren't links. */
  hoverLabel?: string | null;
};

/**
 * Cover image. When no genuine image exists we render a quiet typographic
 * tile instead of stock photography.
 */
export function Cover({ src, title, label, className, priority, sizes = "(min-width: 1024px) 33vw, 100vw", hoverLabel = "View" }: Props) {
  if (src) {
    return (
      <HoverFrame label={hoverLabel} className={cn("aspect-[16/10]", className)}>
        <ParallaxImage src={src} alt={title} sizes={sizes} priority={priority} />
      </HoverFrame>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${title} cover`}
      className={cn("relative aspect-[16/10] overflow-hidden bg-surface-2 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--foreground)_6%,transparent),transparent_55%)]", className)}
    >
      <div className="relative flex h-full flex-col justify-between p-6">
        {label ? <span className="text-xs text-muted-foreground">{label}</span> : <span />}
        <span className="text-balance text-3xl leading-none font-medium tracking-tighter text-foreground/90 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1 sm:text-4xl">
          {title}
        </span>
      </div>
    </div>
  );
}
