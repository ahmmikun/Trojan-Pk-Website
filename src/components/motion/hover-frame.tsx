"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const FOLLOW = { stiffness: 260, damping: 28, mass: 0.6 };
const DRIFT = { stiffness: 90, damping: 20, mass: 0.8 };

type Props = {
  /** Media layer (image, scrim). Zooms and drifts on hover. */
  children: React.ReactNode;
  /** Content above the media (titles, badges). Stays still. */
  overlay?: React.ReactNode;
  className?: string;
  /** Cursor disc text for linked tiles; null shows no disc. */
  label?: string | null;
  /** Background shown before the image loads (clipped with the image on hover). */
  surface?: string;
};

/**
 * Image frame with a mouse-driven hover: the frame tightens to a rounded mat
 * while the image zooms, drifts against the cursor for depth, and a soft light
 * follows the pointer. Linked tiles get a "View" disc that replaces the cursor.
 *
 * Pointer events are read from the enclosing <article> because card links
 * stretch an ::after over the whole card. Mouse only; touch and reduced-motion
 * visitors get a static frame.
 */
export function HoverFrame({ children, overlay, className, label = "View", surface = "bg-surface-2" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const nx = useMotionValue(0.5);
  const ny = useMotionValue(0.5);
  const fx = useSpring(px, FOLLOW);
  const fy = useSpring(py, FOLLOW);
  const dx = useSpring(nx, DRIFT);
  const dy = useSpring(ny, DRIFT);
  const shiftX = useTransform(dx, [0, 1], ["1.6%", "-1.6%"]);
  const shiftY = useTransform(dy, [0, 1], ["1.6%", "-1.6%"]);
  const light = useMotionTemplate`radial-gradient(420px circle at ${fx}px ${fy}px, rgb(255 255 255 / 0.55), transparent 65%)`;

  useEffect(() => {
    const frame = ref.current;
    if (!frame || reduce) return;
    const root = frame.closest<HTMLElement>("article") ?? frame;
    let inside = false;

    const toggle = (next: boolean) => {
      if (next === inside) return;
      inside = next;
      setActive(next);
      if (next && label) root.dataset.mediaHover = "on";
      else delete root.dataset.mediaHover;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = frame.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const within = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (within && !inside) {
        // Start the disc and light at the pointer instead of sliding in from a corner.
        fx.jump(x);
        fy.jump(y);
      }
      px.set(x);
      py.set(y);
      if (within) {
        nx.set(x / r.width);
        ny.set(y / r.height);
      }
      toggle(within);
    };
    const leave = () => {
      toggle(false);
      nx.set(0.5);
      ny.set(0.5);
    };

    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      delete root.dataset.mediaHover;
    };
  }, [reduce, label, px, py, nx, ny, fx, fy]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* The placeholder surface lives on the clipped layer, so the margin the hover opens up
          shows the page itself instead of a lighter frame around the image. */}
      <motion.div
        className={cn("absolute inset-0 overflow-hidden", surface)}
        initial={false}
        animate={{ clipPath: active ? "inset(10px round 14px)" : "inset(0px round 0px)" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { x: shiftX, y: shiftY }}
          initial={false}
          animate={{ scale: active ? 1.08 : 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        >
          {children}
        </motion.div>
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: light }}
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>

      {overlay}

      {label ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-10 -mt-11 -ml-11 flex size-22 items-center justify-center gap-1 rounded-full bg-white/90 text-sm font-medium text-black shadow-[0_8px_30px_rgb(0_0_0/0.25)] backdrop-blur-md"
          style={{ x: fx, y: fy }}
          initial={false}
          animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {label}
          <ArrowUpRight className="size-3.5" />
        </motion.div>
      ) : null}
    </div>
  );
}
