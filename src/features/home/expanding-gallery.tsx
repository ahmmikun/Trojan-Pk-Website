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
    <>
      {/* Desktop: horizontal expanding strips */}
      <ul className="hidden h-[34rem] gap-3 lg:flex">
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
              className="group relative min-w-0 basis-0 cursor-default overflow-hidden rounded-xl bg-surface-2 outline-offset-4"
            >
              <ParallaxImage
                src={item.image}
                alt=""
                sizes="(min-width: 1024px) 50vw, 1px"
                strength={8}
                className={cn("transition-[transform,filter] duration-[1200ms] ease-[var(--ease-premium)]", open ? "scale-100 grayscale-0" : "scale-110 grayscale")}
              />
              <div aria-hidden="true" className={cn("absolute inset-0 transition-colors duration-700", open ? "bg-gradient-to-t from-black/85 via-black/20 to-transparent" : "bg-black/55")} />

              {/* Collapsed: index + vertical title */}
              <div className={cn("absolute inset-0 flex flex-col items-center justify-between py-6 text-white transition-opacity duration-300", open ? "opacity-0" : "opacity-100 delay-200")} aria-hidden="true">
                <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg font-medium whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{item.title}</span>
              </div>

              {/* Expanded: icon, title, description */}
              <div className={cn("absolute inset-x-0 bottom-0 p-8 text-white transition-all duration-500", open ? "translate-y-0 opacity-100 delay-300" : "translate-y-4 opacity-0")}>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">{item.icon}</span>
                  <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 max-w-sm text-3xl font-medium tracking-tight">{item.title}</h3>
                <p className="mt-3 max-w-sm text-base leading-snug text-white/80">{item.description}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {/* Mobile / tablet: simple grid, everything visible */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {items.map((item, i) => (
          <li key={item.title} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-2">
            <ParallaxImage src={item.image} alt="" sizes="(min-width: 640px) 50vw, 100vw" strength={8} />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-2xl font-medium tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-snug text-white/80">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
