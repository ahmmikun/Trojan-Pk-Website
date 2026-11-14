"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/components/motion/motion";
import { useIntroDone } from "@/components/motion/intro-store";

/**
 * Cycles through phrases in place. The box animates to each phrase's width,
 * so the centered line re-centers smoothly instead of leaving gaps.
 * Decorative: the parent <h1> carries the plain sentence for assistive tech.
 */
export function RotatingWords({ words, startDelay = 1.4, interval = 2.6 }: { words: string[]; startDelay?: number; interval?: number }) {
  const reduce = useReducedMotion();
  const ready = useIntroDone();
  const [index, setIndex] = useState(0);

  // The cycle starts only once the opening curtain has lifted.
  useEffect(() => {
    if (reduce || !ready) return;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      timer = setInterval(() => setIndex((i) => (i + 1) % words.length), interval * 1000);
    }, (startDelay + interval) * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [reduce, ready, words.length, startDelay, interval]);

  return (
    <motion.span layout aria-hidden="true" transition={{ layout: { duration: 0.6, ease: EASE } }} className="relative -mx-[0.06em] inline-block overflow-hidden px-[0.06em] pb-[0.12em] align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          data-fm=""
          className="relative block whitespace-nowrap"
          initial={{ y: "100%", opacity: 0 }}
          animate={ready ? { y: 0, opacity: 1, transition: { duration: 0.8, delay: index === 0 ? 0.45 : 0, ease: EASE } } : { y: "100%", opacity: 0 }}
          exit={{ y: "-100%", opacity: 0, transition: { duration: 0.5, ease: EASE } }}
        >
          {words[index]}
          <motion.span
            data-fm=""
            className="absolute inset-x-0 -bottom-[0.06em] h-[0.06em] origin-left rounded-full bg-success"
            initial={{ scaleX: 0 }}
            animate={ready ? { scaleX: 1, transition: { duration: 0.9, delay: index === 0 ? startDelay * 0.6 : 0.3, ease: EASE } } : { scaleX: 0 }}
          />
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

/**
 * A fine dot field that is revealed only around the pointer. Purely decorative,
 * pointer-driven (no autoplay), so it is calm for everyone.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
      el.style.opacity = "1";
    };
    const leave = () => (el.style.opacity = "0");
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
      style={{
        backgroundImage: "radial-gradient(color-mix(in srgb, var(--foreground) 35%, transparent) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        maskImage: "radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), #000, transparent 70%)",
        WebkitMaskImage: "radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), #000, transparent 70%)",
      }}
    />
  );
}
