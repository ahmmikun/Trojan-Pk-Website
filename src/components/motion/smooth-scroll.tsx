"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Lenis smooth scrolling for the whole page. Skipped for visitors who prefer
 * reduced motion, who keep the browser's native scrolling.
 * Elements with `data-lenis-prevent` (e.g. the mobile menu) scroll natively.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
