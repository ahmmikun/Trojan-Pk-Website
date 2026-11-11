"use client";

import { motion, useReducedMotion } from "framer-motion";

const lines = [
  { prompt: "$", text: "trojans learn --by building", tone: "text-foreground" },
  { prompt: ">", text: "collaborating on open source", tone: "text-muted-foreground" },
  { prompt: "$", text: "trojans hack --team pakistan", tone: "text-foreground" },
  { prompt: ">", text: "shipping what's next", tone: "text-muted-foreground" },
];

/**
 * Decorative terminal. Purely illustrative: it displays no statistics or claims.
 * Lines appear in sequence; motion is skipped for reduced-motion users.
 */
export function HeroArtwork() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="relative">
      <div className="overflow-hidden rounded-lg border border-border bg-surface/90 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">trojans-pk ~ community</span>
        </div>
        <div className="relative space-y-3 p-5 font-mono text-[13px] leading-6">
          {lines.map((l, i) => (
            <motion.p
              key={l.text}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.45, duration: 0.4 }}
              className={l.tone}
            >
              <span className="mr-3 text-brand-blue">{l.prompt}</span>
              {l.text}
            </motion.p>
          ))}
          <motion.span
            className="inline-block h-4 w-2 translate-y-0.5 bg-brand-blue"
            animate={reduce ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
            <div className="animate-scan h-16 w-full bg-gradient-to-b from-transparent via-brand-blue/10 to-transparent" />
          </div>
        </div>
      </div>
      <div className="absolute -z-10 -inset-6 rounded-3xl bg-gradient-to-br from-brand-blue/15 via-transparent to-brand-violet/15 blur-2xl" />
    </div>
  );
}
