"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useIntroDone } from "./intro-store";

/**
 * Lenis smooth scrolling for the whole page. Skipped for visitors who prefer
 * reduced motion, who keep the browser's native scrolling.
 * Elements with `data-lenis-prevent` (e.g. the mobile menu) scroll natively.
 * Scrolling is paused while the opening curtain is down.
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const ready = useIntroDone();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis.current = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: true });
    return () => {
      lenis.current?.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    if (ready) lenis.current?.start();
    else lenis.current?.stop();
  }, [ready]);

  return null;
}
