"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useIntroDone } from "./intro-store";

gsap.registerPlugin(ScrollTrigger);

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
    // Keep GSAP ScrollTrigger (pinned story sections) in step with the smoothed scroll.
    lenis.current.on("scroll", ScrollTrigger.update);
    return () => {
      lenis.current?.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      lenis.current?.stop();
      return;
    }
    lenis.current?.start();
    // Safety net: re-measure pinned sections once scrolling is live, in case anything was measured while paused.
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return null;
}
