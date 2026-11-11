import Image from "next/image";
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

/** Deterministic hue so each generated cover is distinct but on-brand (blue to violet range). */
function hueFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return 215 + (h % 70); // 215-285
}

/**
 * Cover image. When no genuine image exists we render a typographic cover
 * (grid + title) instead of stock photography.
 */
export function Cover({ src, title, label, className, priority, sizes = "(min-width: 1024px) 33vw, 100vw" }: Props) {
  if (src) {
    return (
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-surface-2", className)}>
        <Image src={src} alt={title} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const hue = hueFor(title);
  return (
    <div
      role="img"
      aria-label={`${title} cover`}
      className={cn("relative aspect-[16/10] overflow-hidden bg-surface-2", className)}
      style={{ backgroundImage: `radial-gradient(120% 90% at 0% 0%, hsl(${hue} 80% 55% / 0.22), transparent 60%)` }}
    >
      <div aria-hidden="true" className="bg-dots absolute inset-0 opacity-70" />
      <div className="relative flex h-full flex-col justify-between p-5">
        {label ? <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{label}</span> : <span />}
        <span className="text-2xl font-semibold tracking-tight text-foreground/90 sm:text-3xl">{title}</span>
      </div>
    </div>
  );
}
