"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/**
 * Seamless horizontal loop. Children are rendered twice; the track moves left
 * by one copy's width and wraps, so there is never a gap. Pauses while hovered,
 * and stays still for visitors who prefer reduced motion.
 */
export function Marquee({ children, speed = 60 }: { children: React.ReactNode; /** Pixels per second. */ speed?: number }) {
  const reduce = useReducedMotion();
  const first = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const x = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    const width = first.current?.offsetWidth ?? 0;
    if (reduce || hovered.current || width === 0) return;
    let next = x.get() - (speed * Math.min(delta, 64)) / 1000;
    if (next <= -width) next += width;
    x.set(next);
  });

  return (
    <div
      className="relative flex overflow-hidden"
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <motion.div data-marquee-track className="flex w-max will-change-transform" style={{ x }}>
        <div ref={first} className="flex shrink-0">
          {children}
        </div>
        <div aria-hidden="true" className="flex shrink-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
