"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Classes for the <img>, e.g. hover zoom. */
  className?: string;
  /** How far the image travels, as a percentage of its frame height. */
  strength?: number;
};

/**
 * next/image that drifts against the scroll inside its container (fills the
 * nearest positioned parent). The image is rendered taller than the frame so
 * no edge ever shows. Static for visitors who prefer reduced motion.
 */
export function ParallaxImage({ src, alt, sizes, priority, className, strength = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  // The inner layer overhangs the frame by more than it travels, so edges stay hidden.
  const overhang = `${Math.ceil(strength * 1.5)}%`;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-x-0" style={{ top: `-${overhang}`, bottom: `-${overhang}`, y: reduce ? 0 : y }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />
      </motion.div>
    </div>
  );
}
