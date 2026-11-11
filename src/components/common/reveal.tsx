import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Seconds to wait before the entrance starts (immediate reveals only). */
  delay?: number;
  className?: string;
  /** Animate on page load (above-the-fold content) instead of as it scrolls into view. */
  immediate?: boolean;
};

/**
 * Minimal fade-up entrance, done in CSS (see .reveal / .reveal-in-view in globals.css).
 *
 * Content is always present and visible in the HTML: it never depends on
 * JavaScript to appear. Scroll-triggered reveals use CSS scroll-driven
 * animations where the browser supports them and simply show elsewhere.
 * Users who prefer reduced motion get no animation.
 */
export function Reveal({ children, delay = 0, className, immediate = false }: Props) {
  return (
    <div
      className={cn(immediate ? "reveal" : "reveal-in-view", className)}
      style={immediate && delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
