"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { INTRO_KEY } from "@/lib/intro";
import { markIntroDone } from "./intro-store";

/** Slow-fast-slow cubic bezier for the lift. */
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
const TEXT_EASE = [0.22, 1, 0.36, 1] as const;

const HOLD = 1.5; // seconds the curtain stays down
const LIFT = 1.1; // seconds the curtain takes to leave
const HANDOFF = 0.45; // hero starts this long into the lift

/* Trailing edge of the curtain: a downward bezier bulge that flattens as it rises. */
const CURVED = "M0 0 L100 0 Q50 100 0 0 Z";
const FLAT = "M0 0 L100 0 Q50 0 0 0 Z";

const WORD = "Trojans";

/**
 * Minimal cinematic opening: the wordmark rises in, then the curtain lifts on a
 * bezier curve and the hero animates in underneath. Once per tab session.
 * Server-rendered so it covers the page from the first paint. Its colour sits
 * just off the page background, so a reload never flashes a bright frame.
 * Hidden before paint for repeat views and reduced motion (inline script in
 * layout.tsx) and by a <noscript> rule when JavaScript is off.
 */
export function IntroCurtain() {
  const [phase, setPhase] = useState<"intro" | "lift" | "gone">("intro");

  useEffect(() => {
    if (document.documentElement.classList.contains("intro-skip")) {
      markIntroDone();
      // The overlay is already hidden by CSS; drop it from the tree.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("gone");
      return;
    }
    // Mark as seen up front, so a reload mid-intro does not replay it.
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* storage blocked: the intro simply plays again next load */
    }
    const timers = [
      setTimeout(() => setPhase("lift"), HOLD * 1000),
      setTimeout(markIntroDone, (HOLD + HANDOFF) * 1000),
      setTimeout(() => setPhase("gone"), (HOLD + LIFT + 0.1) * 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "gone") return null;
  const lifting = phase === "lift";

  return (
    <motion.div
      data-intro=""
      aria-hidden="true"
      className={lifting ? "pointer-events-none fixed inset-0 z-[100]" : "fixed inset-0 z-[100]"}
      initial={false}
      animate={{ y: lifting ? "-100%" : "0%" }}
      transition={{ duration: LIFT, ease: CURTAIN_EASE }}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-surface-2 text-foreground">
        {/* Wordmark. Generous bottom padding inside the masks keeps descenders (the j) intact. */}
        <div className="flex items-baseline gap-[0.2em] text-[17vw] leading-none font-medium tracking-[-0.055em] sm:text-[12vw]">
          <span className="-mx-[0.1em] flex overflow-hidden px-[0.1em] pt-[0.05em] pb-[0.22em]">
            {WORD.split("").map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                className="inline-block"
                initial={{ y: "120%" }}
                animate={{ y: lifting ? "-120%" : "0%" }}
                transition={lifting ? { duration: 0.6, delay: i * 0.025, ease: CURTAIN_EASE } : { duration: 0.9, delay: 0.15 + i * 0.05, ease: TEXT_EASE }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          <span className="-mx-[0.1em] flex overflow-hidden px-[0.1em] pt-[0.05em] pb-[0.22em] text-muted-foreground">
            <motion.span
              className="inline-block"
              initial={{ y: "120%" }}
              animate={{ y: lifting ? "-120%" : "0%" }}
              transition={lifting ? { duration: 0.6, delay: 0.18, ease: CURTAIN_EASE } : { duration: 0.9, delay: 0.55, ease: TEXT_EASE }}
            >
              PK
            </motion.span>
          </span>
        </div>
      </div>

      {/* Curved trailing edge, hanging just below the curtain */}
      <svg className="absolute top-full left-0 h-[16vh] w-full text-surface-2" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <motion.path
          fill="currentColor"
          initial={{ d: CURVED }}
          animate={{ d: lifting ? FLAT : CURVED }}
          transition={{ duration: LIFT, ease: CURTAIN_EASE }}
        />
      </svg>
    </motion.div>
  );
}
