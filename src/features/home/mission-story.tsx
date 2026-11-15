"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Mobile browsers resize the viewport as the address bar hides; don't re-layout the pin for that.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Phones play the story once per page load; a reload re-evaluates this module and resets it. */
let playedThisLoad = false;

export type Principle = { title: string; body: string };

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  principles: Principle[];
};

/* ---------- Deterministic scene data (same on server and client) ---------- */

function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

const CX = 800;
const CY = 330;
const rand = prng(11);

/** The network: a hub (index 0) and members scattered in an ellipse around it. */
const NODES = [
  { x: CX, y: CY },
  ...Array.from({ length: 38 }, () => {
    const a = rand() * Math.PI * 2;
    const r = 0.22 + Math.sqrt(rand()) * 0.78;
    return {
      x: r1(Math.min(1540, Math.max(60, CX + Math.cos(a) * r * 720))),
      // Kept above y=580 so the network never runs through the caption band.
      y: r1(Math.min(580, Math.max(40, CY + Math.sin(a) * r * 270))),
    };
  }),
];

/** Each node links to its two nearest neighbours. Sorted outward from the hub so links draw in a wave. */
const EDGES = (() => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  NODES.forEach((a, i) => {
    NODES.map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push([i, j]);
        }
      });
  });
  const far = ([a, b]: [number, number]) => Math.hypot((NODES[a].x + NODES[b].x) / 2 - CX, (NODES[a].y + NODES[b].y) / 2 - CY);
  return out.sort((p, q) => far(p) - far(q));
})();

/** Signals that travel along a few links once the network has formed. */
const PULSES = EDGES.filter((_, i) => i % 4 === 1).slice(0, 12);

/** The city: a 7x7 grid of blocks, tallest near the middle. */
const GRID = 7;
const BLOCKS = Array.from({ length: GRID * GRID }, (_, k) => {
  const gx = k % GRID;
  const gy = Math.floor(k / GRID);
  const d = Math.hypot(gx - 3, gy - 3);
  return {
    f: Math.round(Math.max(0.2, (3.4 - d) * 0.6 + rand() * 0.9) * 100) / 100,
    accent: rand() < 0.1,
  };
});

/* ---------------------------------- UI ---------------------------------- */

function Words({ text, attr, className }: { text: string; attr: "data-w" | "data-fw"; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="-mx-[0.06em] inline-block overflow-hidden px-[0.06em] pb-[0.1em] align-bottom">
            <span {...{ [attr]: "" }} className={className ?? "inline-block"}>
              {w}
            </span>
          </span>
          {/* The space sits outside the mask: trailing spaces inside an inline-block collapse. */}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

const captions = ["Every builder starts alone.", "Then they find each other.", "And start shipping real products."];

const face = {
  // Light: pale tops with darker walls. Dark: bright tops that fade into the night.
  top: "bg-[color-mix(in_srgb,var(--foreground)_6%,var(--background))] dark:bg-[color-mix(in_srgb,var(--foreground)_88%,var(--background))]",
  front: "bg-[color-mix(in_srgb,var(--foreground)_22%,var(--background))] dark:bg-[color-mix(in_srgb,var(--foreground)_55%,var(--background))]",
  side: "bg-[color-mix(in_srgb,var(--foreground)_40%,var(--background))] dark:bg-[color-mix(in_srgb,var(--foreground)_32%,var(--background))]",
  accentTop: "bg-success",
  accentFront: "bg-[color-mix(in_srgb,var(--success)_70%,var(--background))]",
  accentSide: "bg-[color-mix(in_srgb,var(--success)_45%,var(--background))]",
};

/**
 * "Our mission" told as a scroll-scrubbed story on one pinned stage (GSAP ScrollTrigger):
 *   1. A single node appears: "Every builder starts alone."
 *   2. Members fly in and their links draw: "Then they find each other."
 *   3. The network collapses and an isometric CSS 3D city rises: "And start shipping real products."
 *   4. The camera pushes into the city, which becomes a backdrop for the mission and its principles.
 *
 * Phones get scenes 1-3 as a self-playing film (portrait layout, once per page load) and the mission as a normal section after it.
 * Without JS or with reduced motion, only the final mission content renders, in normal flow.
 */
export function MissionStory({ eyebrow, title, description, principles }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        if (!motion) return;
        // Desktop pins the whole story including the mission scene and scrubs it with scroll. Phones play
        // scenes 1-3 by themselves once; the mission then follows as a normal section.
        el.setAttribute("data-story", desktop ? "desktop" : "mobile");
        const q = gsap.utils.selector(el);
        const caps = q("[data-cap]");

        // Phones: re-map the wide network into a portrait layout (positions only;
        // the links stay the same) so it fills a tall screen instead of a thin strip.
        const svg = q("[data-net]")[0] as unknown as SVGSVGElement;
        const MW = 400;
        const MH = 490;
        const P = desktop
          ? NODES
          : NODES.map((n) => ({ x: r1(MW / 2 + ((n.y - CY) / 270) * 180), y: r1(MH / 2 + ((n.x - CX) / 720) * 225) }));
        const hx = P[0].x;
        const hy = P[0].y;
        svg.setAttribute("viewBox", desktop ? "0 0 1600 800" : `0 0 ${MW} ${MH}`);
        svg.setAttribute("preserveAspectRatio", desktop ? "xMidYMid slice" : "xMidYMid meet");
        q("[data-node]").forEach((n, i) => {
          n.setAttribute("cx", String(P[i + 1].x));
          n.setAttribute("cy", String(P[i + 1].y));
          n.dataset.x = String(P[i + 1].x);
          n.dataset.y = String(P[i + 1].y);
        });
        q("[data-edge]").forEach((line, i) => {
          const [a, b] = EDGES[i];
          line.setAttribute("x1", String(P[a].x));
          line.setAttribute("y1", String(P[a].y));
          line.setAttribute("x2", String(P[b].x));
          line.setAttribute("y2", String(P[b].y));
        });
        q("[data-hub], [data-ring], [data-breath], [data-burst]").forEach((c) => {
          c.setAttribute("cx", String(hx));
          c.setAttribute("cy", String(hy));
        });

        gsap.set(caps, { autoAlpha: 0 });
        // Explicit y: 0 everywhere: on refresh GSAP would otherwise re-read the
        // percent offset as pixels and leave words stuck below their masks.
        gsap.set(q("[data-w]"), { yPercent: 115, y: 0 });
        gsap.set(q("[data-hub]"), { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(q("[data-ring], [data-burst]"), { scale: 0.3, opacity: 0, transformOrigin: "50% 50%" });
        q("[data-node]").forEach((n) => {
          gsap.set(n, { x: (Number(n.dataset.x) - hx) * 1.7, y: (Number(n.dataset.y) - hy) * 1.7, opacity: 0 });
        });
        gsap.set(q("[data-edge]"), { strokeDashoffset: 1, opacity: 0 });
        gsap.set(q("[data-pulses]"), { autoAlpha: 0 });
        gsap.set(q("[data-city]"), { autoAlpha: 0 });
        gsap.set(q("[data-cam]"), { rotationX: 0, y: 0 });
        gsap.set(q("[data-plane]"), { rotation: 0, scale: 0.55 });
        gsap.set(q("[data-block]"), { "--f": 0, "--lift": 0 });
        gsap.set(q("[data-accent]"), { "--lift": 9, visibility: "hidden" });
        if (desktop) {
          gsap.set(q("[data-fw]"), { yPercent: 115, y: 0 });
          gsap.set(q("[data-ff]"), { autoAlpha: 0, y: 28 });
        }
        gsap.set(q("[data-hint], [data-rail]"), { autoAlpha: 1 });

        /* Ambient loops (time-based, not scrubbed): the lone builder breathes,
           and signals run along the links. They only show while their scene does. */
        gsap.fromTo(q("[data-breath]"), { scale: 1, opacity: 0.55 }, { scale: 3.2, opacity: 0, duration: 2.4, ease: "power1.out", repeat: -1, transformOrigin: "50% 50%" });
        q("[data-pulse]").forEach((dot, i) => {
          const [a, b] = PULSES[i];
          gsap.fromTo(
            dot,
            { attr: { cx: P[a].x, cy: P[a].y } },
            { attr: { cx: P[b].x, cy: P[b].y }, duration: 1.1 + (i % 4) * 0.25, ease: "power1.inOut", repeat: -1, yoyo: true, delay: (i % 6) * 0.3 },
          );
        });

        /* Captions and the scene rail are not scrubbed. The scroll position picks
           the active scene and only that caption plays a short timed reveal. There
           is no tween history to replay, so a reload, hot reload or fast scroll can
           never leave two captions on screen. */
        const CAPTION_AT: [number, number][] = [
          [0.1, 1.6],
          [2.6, 4.3],
          [5.7, desktop ? 7.3 : 99],
        ];
        const SCENE_AT = [0, 2.2, 4.9, 7.4];
        const railItems = q("[data-rail-item]");
        const capWords = [...caps].map((cap) => cap.querySelectorAll("[data-w]"));
        let current = -1;
        const showCaption = (next: number, instant: boolean, down: boolean) => {
          if (next === current) return;
          const prev = current;
          current = next;
          if (prev >= 0) {
            gsap.to(capWords[prev], { yPercent: down ? -115 : 115, y: 0, duration: instant ? 0 : 0.45, stagger: 0.03, ease: "power2.in", overwrite: true });
            gsap.to(caps[prev], { autoAlpha: 0, duration: 0, delay: instant ? 0 : 0.55, overwrite: true });
          }
          if (next >= 0) {
            gsap.set(caps[next], { autoAlpha: 1, overwrite: true });
            gsap.fromTo(
              capWords[next],
              { yPercent: down ? 115 : -115, y: 0 },
              { yPercent: 0, y: 0, duration: instant ? 0 : 0.9, stagger: 0.06, ease: "power3.out", delay: instant || prev < 0 ? 0 : 0.2, overwrite: true },
            );
          }
        };
        const sync = (time: number, instant: boolean, down = true) => {
          showCaption(
            CAPTION_AT.findIndex(([a, b]) => time >= a && time < b),
            instant,
            down,
          );
          const scene = SCENE_AT.filter((s) => time >= s).length - 1;
          railItems.forEach((item, i) => item.setAttribute("data-active", String(i === scene)));
        };

        // A hot reload can leave the previous instance behind; never run two.
        ScrollTrigger.getById("mission-story")?.kill(true);

        const tl = desktop
          ? gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                id: "mission-story",
                trigger: el,
                start: "top top",
                end: "+=520%",
                pin: q("[data-pin]")[0],
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // Use scroll progress (not the smoothed playhead) so the caption always matches where you are.
                onUpdate: (self) => sync(self.progress * (self.animation?.duration() ?? 0), false, self.direction >= 0),
                onRefresh: (self) => sync(self.progress * (self.animation?.duration() ?? 0), true),
              },
            })
          : // Phones: a self-playing film, no pin and no scrubbing. Captions follow the playhead.
            gsap.timeline({ defaults: { ease: "none" }, paused: true, onUpdate: () => sync(tl.time(), false) });

        // Scene 1: alone.
        tl.to(q("[data-hint]"), { autoAlpha: 0, duration: 0.4 }, 0)
          .to(q("[data-hub]"), { scale: 1, duration: 0.8, ease: "back.out(2.2)" }, 0)
          .fromTo(q("[data-ring]"), { scale: 0.3, opacity: 0.7 }, { scale: 5, opacity: 0, duration: 1.4, ease: "power2.out" }, 0.2);

        // Scene 2: they find each other. Links draw outward from the hub, then signals start running.
        tl.to(q("[data-node]"), { x: 0, y: 0, opacity: 1, duration: 1.4, stagger: { each: 0.018, from: "random" }, ease: "power3.out" }, 2.2)
          .to(q("[data-edge]"), { strokeDashoffset: 0, opacity: 1, duration: 0.5, stagger: 0.016, ease: "power2.out" }, 2.8)
          .to(q("[data-pulses]"), { autoAlpha: 1, duration: 0.3 }, 3.7)
          .to(q("[data-ring]"), { opacity: 0, duration: 0.1 }, 2.2);

        // Transition: everyone pulls into the hub, which flashes out a shockwave.
        tl.to(q("[data-pulses]"), { autoAlpha: 0, duration: 0.2 }, 4.3)
          .to(q("[data-edge]"), { opacity: 0, duration: 0.35, ease: "power1.in" }, 4.3)
          .to(
            q("[data-node]"),
            { x: (_: number, t: SVGElement) => hx - Number(t.dataset.x), y: (_: number, t: SVGElement) => hy - Number(t.dataset.y), duration: 0.6, stagger: { each: 0.008, from: "edges" }, ease: "power3.in" },
            4.3,
          )
          .to(q("[data-hub]"), { scale: 2.2, duration: 0.4, ease: "power2.in" }, 4.55)
          .fromTo(q("[data-burst]"), { scale: 0.3, opacity: 0.9 }, { scale: 14, opacity: 0, duration: 0.9, ease: "power2.out", immediateRender: false }, 4.95)
          .to(q("[data-net] [data-members]"), { opacity: 0, duration: 0.2 }, 4.95)
          .to(q("[data-hub]"), { scale: 0, duration: 0.35, ease: "power2.in" }, 5.0)
          .to(q("[data-net]"), { opacity: 0, duration: 0.4 }, 5.4);

        // Scene 3: the city grows out of the burst, products drop in, the camera orbits.
        const accents = q("[data-accent]");
        tl.to(q("[data-city]"), { autoAlpha: 1, duration: 0.25 }, 5.0)
          .to(q("[data-cam]"), { rotationX: 58, duration: 1.3, ease: "power2.inOut" }, 5.0)
          .to(q("[data-plane]"), { rotation: -45, scale: 1, duration: 1.3, ease: "power2.inOut" }, 5.0)
          .to(
            q("[data-block]:not([data-accent])"),
            { "--f": (_: number, t: HTMLElement) => Number(t.dataset.f), duration: 0.9, stagger: { each: 0.014, from: "center", grid: [GRID, GRID] }, ease: "back.out(1.6)" },
            5.4,
          )
          .set(accents, { visibility: "visible", "--f": (_: number, t: HTMLElement) => Number(t.dataset.f) }, 6.1)
          .to(accents, { "--lift": 0, duration: 0.55, stagger: 0.12, ease: "power3.in" }, 6.1)
          .to(q("[data-plane]"), { rotation: -57, duration: 1.1, ease: "sine.inOut" }, 6.3);

        if (!desktop) {
          tl.to({}, { duration: 0.6 });
          gsap.set(q("[data-hint]"), { autoAlpha: 0 });
          if (playedThisLoad) {
            // Already watched during this page load (e.g. navigated away and back): rest on the finished city.
            tl.progress(1);
            sync(tl.time(), true);
          } else {
            // Plays once, when most of the stage is on screen. A reload resets the module, so it plays again.
            ScrollTrigger.create({
              id: "mission-story",
              trigger: q("[data-stage]")[0],
              start: "top 35%",
              once: true,
              onEnter: () => {
                playedThisLoad = true;
                tl.play();
              },
            });
          }
          return () => el.removeAttribute("data-story");
        }

        // Scene 4: the city sinks and recedes into a faint backdrop; the mission takes over.
        tl.to(q("[data-plane]"), { rotation: -18, scale: 1.6, duration: 1.6, ease: "power2.inOut" }, 7.4)
          .to(q("[data-cam]"), { y: "24vh", duration: 1.6, ease: "power2.inOut" }, 7.4)
          .to(q("[data-city]"), { opacity: 0.07, duration: 1.2 }, 7.6)
          .to(q("[data-rail]"), { autoAlpha: 0, duration: 0.5 }, 8.6)
          .fromTo(q("[data-fw]"), { yPercent: 115, y: 0 }, { yPercent: 0, y: 0, stagger: 0.05, duration: 0.8, ease: "power3.out", immediateRender: false }, 8.0)
          .fromTo(q("[data-ff]"), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.6, ease: "power2.out", immediateRender: false }, 8.5)
          .to({}, { duration: 0.8 });

        return () => el.removeAttribute("data-story");
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about-community" aria-labelledby="mission-title" className="group/story relative border-t border-border">
      <div data-pin className="relative">
        {/* ---- Story stage (decorative; hidden until the story is active) ---- */}
        <div aria-hidden="true" data-stage className="relative hidden h-svh overflow-hidden group-data-[story]/story:block">
          {/* Phones: the wide network is turned upright (rotated 90deg) to fill a portrait screen. */}
          <svg
            data-net
            viewBox="0 0 1600 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-x-0 top-[13svh] h-[57svh] w-full md:inset-0 md:h-full"
          >
            <g className="text-foreground/25">
              {EDGES.map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  data-edge
                  x1={NODES[a].x}
                  y1={NODES[a].y}
                  x2={NODES[b].x}
                  y2={NODES[b].y}
                  stroke="currentColor"
                  strokeWidth="1"
                  pathLength={1}
                  strokeDasharray="1 1"
                />
              ))}
            </g>
            <g data-members className="text-foreground/75">
              {NODES.slice(1).map((n, i) => (
                <circle key={i} data-node data-x={n.x} data-y={n.y} cx={n.x} cy={n.y} r={i % 5 === 0 ? 5 : 3.5} fill="currentColor" />
              ))}
            </g>
            <g data-pulses>
              {PULSES.map(([a], i) => (
                <circle key={i} data-pulse cx={NODES[a].x} cy={NODES[a].y} r="2.6" fill="var(--success)" />
              ))}
            </g>
            <circle data-breath cx={CX} cy={CY} r="12" fill="none" stroke="var(--success)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle data-ring cx={CX} cy={CY} r="16" fill="none" stroke="var(--success)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <circle data-burst cx={CX} cy={CY} r="20" fill="none" stroke="var(--success)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle data-hub cx={CX} cy={CY} r="9" fill="var(--success)" />
          </svg>

          <div data-city className="absolute inset-0 flex items-center justify-center [--cell:min(8vw,5.4svh)] md:[--cell:min(4.4vw,6.2vh)] [perspective:2400px]">
            <div data-cam className="[transform-style:preserve-3d]">
              <div
                data-plane
                className="grid gap-[calc(var(--cell)*0.14)] [transform-style:preserve-3d]"
                style={{ gridTemplateColumns: `repeat(${GRID}, var(--cell))`, gridAutoRows: "var(--cell)" }}
              >
                {BLOCKS.map((b, k) => (
                  <div key={k} data-block data-f={b.f} data-accent={b.accent ? "" : undefined} className="relative [--f:0] [--lift:0] [transform-style:preserve-3d]">
                    <div className="absolute inset-0 bg-foreground/[0.06]" />
                    {/* Accent blocks ("products") fall into place: the whole block rides on --lift. */}
                    <div className="absolute inset-0 [transform-style:preserve-3d] [transform:translateZ(calc(var(--cell)*var(--lift)))]">
                      <div
                        className={`absolute inset-0 [transform:translateZ(calc(var(--cell)*var(--f)))] ${b.accent ? `${face.accentTop} shadow-[0_0_36px_6px_color-mix(in_srgb,var(--success)_55%,transparent)]` : face.top}`}
                      />
                      <div className={`absolute top-full left-0 h-[calc(var(--cell)*var(--f))] w-full origin-top [transform:rotateX(90deg)] ${b.accent ? face.accentFront : face.front}`} />
                      <div className={`absolute top-0 left-full h-full w-[calc(var(--cell)*var(--f))] origin-left [transform:rotateY(-90deg)] ${b.accent ? face.accentSide : face.side}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scene rail: which chapter of the story you are in. */}
          <ol data-rail className="invisible absolute top-[calc(var(--nav-h)+0.5rem)] left-5 flex gap-4 text-xs md:top-1/2 md:right-6 md:left-auto md:-translate-y-1/2 md:flex-col lg:right-12">
            {["Alone", "Connect", "Build", "Mission"].map((label, i) => (
              <li key={label} data-rail-item data-active="false" className="group/rail flex flex-row-reverse items-center justify-end gap-2 last:hidden md:flex-row md:gap-3 md:last:flex">
                <span className="hidden text-muted-foreground opacity-0 transition-opacity md:inline duration-500 group-data-[active=true]/rail:text-foreground group-data-[active=true]/rail:opacity-100">
                  {label}
                </span>
                <span className="tabular text-muted-foreground transition-colors duration-500 group-data-[active=true]/rail:text-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px w-3 bg-foreground/25 transition-all duration-500 ease-[var(--ease-premium)] group-data-[active=true]/rail:w-8 group-data-[active=true]/rail:bg-success" />
              </li>
            ))}
          </ol>

          {captions.map((c) => (
            <p
              key={c}
              data-cap
              className="absolute inset-x-0 bottom-[10svh] px-6 text-center text-[clamp(2.1rem,4.2vw,4.25rem)] leading-[1.02] text-balance font-medium tracking-[-0.045em]"
            >
              <Words text={c} attr="data-w" />
            </p>
          ))}

          <p data-hint className="invisible absolute inset-x-0 bottom-8 text-center text-sm text-muted-foreground">
            Scroll
          </p>
        </div>

        {/* ---- Final scene: the mission. Plain content without the story. ---- */}
        <div className="relative py-24 sm:py-32 group-data-[story=desktop]/story:absolute group-data-[story=desktop]/story:inset-0 group-data-[story=desktop]/story:flex group-data-[story=desktop]/story:items-center group-data-[story=desktop]/story:py-0">
          <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
            <p data-ff className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
              {eyebrow}
            </p>
            <h2 id="mission-title" className="mt-6 max-w-[14ch] text-[clamp(2.75rem,6.4vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.05em]">
              <Words text={title} attr="data-fw" />
            </h2>
            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
              <p data-ff className="max-w-md text-lg leading-snug text-muted-foreground lg:col-span-4">
                {description}
              </p>
              <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
                {principles.map((p, i) => (
                  <li key={p.title} data-ff className="border-t border-foreground/20 pt-5">
                    <span className="tabular text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 text-xl font-medium tracking-tight">{p.title}</h3>
                    <p className="mt-2 text-sm leading-snug text-muted-foreground">{p.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div data-ff className="mt-12">
              <Link
                href="/about"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground py-1.5 pr-1.5 pl-6 text-[15px] font-medium text-background transition-colors duration-300 hover:bg-foreground/90"
              >
                About Trojans PK
                <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-background text-foreground">
                  <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
