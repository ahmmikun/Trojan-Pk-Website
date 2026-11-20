"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { EASE } from "@/components/motion/motion";
import { cn } from "@/lib/utils";

export type GalleryItem = { title: string; description: string; image: string; icon: React.ReactNode };

/**
 * Tall, narrow photo tiles in a row. The hovered (or keyboard-focused) tile
 * widens to show its title and description; the rest shrink to slim strips.
 * On smaller screens it becomes a regular grid with all text visible.
 */
export function ExpandingGallery({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:flex lg:h-[34rem] lg:gap-3">
      {items.map((item, i) => {
        const open = active === i;
        return (
          <motion.li
            key={item.title}
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            animate={{ flexGrow: open ? 5 : 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="group relative min-w-0 cursor-default overflow-hidden rounded-xl bg-surface-2 outline-offset-4 aspect-[4/5] sm:aspect-auto lg:basis-0"
          >
            <ParallaxImage
              src={item.image}
              alt=""
              sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
              strength={8}
              className={cn(
                "transition-[transform,filter] duration-[1200ms] ease-[var(--ease-premium)]",
                open ? "lg:scale-100 lg:grayscale-0" : "lg:scale-110 lg:grayscale",
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-colors duration-700 bg-gradient-to-t from-black/85 via-black/25 to-transparent",
                open ? "lg:bg-gradient-to-t lg:from-black/85 lg:via-black/20 lg:to-transparent" : "lg:bg-black/55",
              )}
            />

            {/* Desktop Collapsed: index + vertical title (hidden on mobile, hidden when open on desktop) */}
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 hidden flex-col items-center justify-between py-6 text-white transition-opacity duration-300 lg:flex",
                open ? "opacity-0" : "opacity-100 delay-200",
              )}
            >
              <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-lg font-medium whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                {item.title}
              </span>
            </div>

            {/* Card text: visible on mobile, expanded on desktop */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 p-6 text-white transition-all duration-500 lg:p-8",
                open ? "lg:translate-y-0 lg:opacity-100 lg:delay-300" : "lg:translate-y-4 lg:opacity-0",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">
                  {item.icon}
                </span>
                <span className="font-mono text-xs opacity-70">
                  {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-medium tracking-tight sm:mt-5 sm:text-3xl lg:max-w-sm">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-snug text-white/80 sm:mt-3 sm:text-base lg:max-w-sm">
                {item.description}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
