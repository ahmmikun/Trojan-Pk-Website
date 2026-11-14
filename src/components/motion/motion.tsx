"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIntroDone } from "./intro-store";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Respects the visitor's reduced-motion setting everywhere below it. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.7, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds before the entrance starts. */
  delay?: number;
  /** Play on load (above the fold) instead of when scrolled into view. */
  immediate?: boolean;
  y?: number;
};

/**
 * Fade and rise. Content is in the server HTML; `data-fm` lets <noscript> CSS show it without JS.
 * Immediate (above-the-fold) reveals wait for the opening curtain to lift.
 */
export function Reveal({ children, className, delay = 0, immediate = false, y = 18 }: RevealProps) {
  const ready = useIntroDone();
  const initial = { opacity: 0, y };
  const shown = { opacity: 1, y: 0, transition: { delay } };
  return (
    <motion.div
      data-fm=""
      className={className}
      initial={initial}
      {...(immediate
        ? { animate: ready ? shown : initial }
        : { whileInView: shown, viewport: { once: true, margin: "0px 0px -12% 0px" } })}
    >
      {children}
    </motion.div>
  );
}

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

/** List container that staggers its <StaggerItem> children as it scrolls into view. */
export function Stagger({ children, className, as = "ul" }: { children: React.ReactNode; className?: string; as?: "ul" | "ol" | "div" }) {
  const Tag = motion[as];
  return (
    <Tag data-fm="" className={className} variants={group} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = "li" }: { children: React.ReactNode; className?: string; as?: "li" | "div" }) {
  const Tag = motion[as];
  return (
    <Tag data-fm="" className={className} variants={item}>
      {children}
    </Tag>
  );
}

/**
 * Headline whose words slide up out of a mask. The text stays plain text for
 * search engines and screen readers.
 */
export function WordReveal({ text, className, delay = 0, decorative = false }: { text: string; className?: string; delay?: number; decorative?: boolean }) {
  const ready = useIntroDone();
  const words = text.split(" ");
  return (
    <span aria-hidden={decorative || undefined} className={cn("inline", className)}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="-mx-[0.06em] inline-block overflow-hidden px-[0.06em] pb-[0.08em] align-bottom">
          <motion.span
            data-fm=""
            className="inline-block"
            initial={{ y: "105%" }}
            animate={ready ? { y: 0, transition: { delay: delay + i * 0.045, duration: 0.85, ease: EASE } } : { y: "105%" }}
          >
            {w}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
