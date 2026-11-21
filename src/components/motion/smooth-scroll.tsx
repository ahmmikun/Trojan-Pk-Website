"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { markIntroDone, useIntroDone } from "./intro-store";

gsap.registerPlugin(ScrollTrigger);

/** The curtain hands over after 1.95 s; this is the hard upper bound before scrolling is released anyway. */
const INTRO_MAX_MS = 4000;

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

  // Scrolling waits for the opening curtain. Pages rendered without one (the root 404) must not
  // wait at all, and a curtain that never reports back (e.g. a script error) must not lock the
  // page: release after the longest the curtain can take.
  useEffect(() => {
    if (!document.querySelector("[data-intro]")) markIntroDone();
    const release = setTimeout(markIntroDone, INTRO_MAX_MS);
    return () => clearTimeout(release);
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
