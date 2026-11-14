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
};

/**
 * Cover image. When no genuine image exists we render a quiet typographic
 * tile instead of stock photography.
 */
export function Cover({ src, title, label, className, priority, sizes = "(min-width: 1024px) 33vw, 100vw" }: Props) {
  if (src) {
    return (
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-surface-2", className)}>
        <ParallaxImage
          src={src}
          alt={title}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03]"
        />
      </div>
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
