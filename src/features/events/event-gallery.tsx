"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HoverFrame } from "@/components/motion/hover-frame";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { cn } from "@/lib/utils";
import type { EventPhoto } from "@/types/content";

const EASE = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Tile layout by count. Rows of two wide photos, then three tall ones, repeating
 * (the events grid rhythm). Small sets get layouts of their own.
 */
function tile(i: number, count: number): { span: string; aspect: string; sizes: string } {
  const full = { span: "col-span-2 lg:col-span-6", aspect: "aspect-[4/3] sm:aspect-[21/9]", sizes: "100vw" };
  const half = { span: "col-span-2 sm:col-span-1 lg:col-span-3", aspect: "aspect-[4/3] sm:aspect-[16/11]", sizes: "(min-width: 640px) 50vw, 100vw" };
  const third = { span: "col-span-1 lg:col-span-2", aspect: "aspect-[4/5]", sizes: "(min-width: 1024px) 33vw, 50vw" };
  // Below lg the grid has two columns, so the third tall photo of a row would sit alone: widen it there.
  const lastOfThree = { span: "col-span-2 lg:col-span-2", aspect: "aspect-[16/10] lg:aspect-[4/5]", sizes: "(min-width: 1024px) 33vw, 100vw" };
  if (count === 1) return full;
  if (count === 2) return half;
  if (count === 3) return i === 0 ? full : half;
  if (count === 4) return i === 0 ? full : i === 3 ? lastOfThree : third;
  if (i % 5 < 2) return half;
  return i % 5 === 4 || (i === count - 1 && i % 5 === 2) ? lastOfThree : third;
}

/**
 * Event photo gallery: an editorial grid (parallax + hover frame on every photo) that
 * opens a full-screen viewer. The viewer supports arrow keys, swipe, a thumbnail strip
 * and Escape. Without JavaScript each tile is a plain link to the full image.
 */
export function EventGallery({ photos, title }: { photos: EventPhoto[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!photos.length) return null;
  const alt = (p: EventPhoto, i: number) => p.alt || `${title}, photo ${i + 1}`;

  return (
    <>
      <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-6">
        {photos.map((p, i) => {
          const t = tile(i, photos.length);
          return (
            <StaggerItem key={`${p.src}-${i}`} className={t.span}>
              <article className="group relative">
                <HoverFrame className={cn("rounded-md", t.aspect)} label="View">
                  <ParallaxImage src={p.src} alt={alt(p, i)} sizes={t.sizes} strength={8} />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-data-[media-hover=on]:opacity-0" />
                </HoverFrame>
                <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 text-xs font-medium text-white tabular-nums drop-shadow transition-opacity duration-500 group-data-[media-hover=on]:opacity-0 sm:bottom-4 sm:left-4">
                  {pad(i + 1)}
                </span>
                <a
                  href={p.src}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setIndex(i);
                  }}
                  className="absolute inset-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="sr-only">Open photo {i + 1} of {photos.length}: {alt(p, i)}</span>
                </a>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Lightbox photos={photos} alt={alt} index={index} onIndex={setIndex} />
    </>
  );
}

function Lightbox({ photos, alt, index, onIndex }: { photos: EventPhoto[]; alt: (p: EventPhoto, i: number) => string; index: number | null; onIndex: (i: number | null) => void }) {
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const current = index ?? 0;
  const count = photos.length;
  const photo = photos[current];

  const go = (by: number) => {
    if (index === null || count < 2) return;
    setDirection(by);
    onIndex((index + by + count) % count);
  };
  const jump = (to: number) => {
    setDirection(to > current ? 1 : -1);
    onIndex(to);
  };

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!open) return;
    stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${current}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [open, current, reduce]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const neighbours = count > 1 ? [(current + 1) % count, (current - 1 + count) % count] : [];

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onIndex(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          data-lenis-prevent
          onKeyDown={(e) => {
            const by = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (!by) return;
            e.preventDefault();
            go(by);
          }}
          className="fixed inset-0 z-50 flex h-dvh flex-col text-white outline-none transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0"
        >
          <Dialog.Title className="sr-only">Photo {current + 1} of {count}</Dialog.Title>
          <Dialog.Description className="sr-only">Use the arrow keys or swipe to move between photos.</Dialog.Description>

          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <p className="text-sm tabular-nums text-white/70" aria-live="polite">
              <span className="text-white">{pad(current + 1)}</span> / {pad(count)}
            </p>
            <Dialog.Close className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none" aria-label="Close photo viewer">
              <span aria-hidden="true" className="max-sm:hidden">Close</span>
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {photo ? (
                <motion.div
                  key={current}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 80, scale: reduce ? 1 : 0.98 }),
                    center: { opacity: 1, x: 0, scale: 1 },
                    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -80, scale: reduce ? 1 : 0.98 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE }}
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={onDragEnd}
                  className="absolute inset-x-4 inset-y-2 cursor-grab touch-pan-y active:cursor-grabbing sm:inset-x-20"
                >
                  <Image src={photo.src} alt={alt(photo, current)} fill sizes="100vw" priority draggable={false} className="pointer-events-none object-contain select-none" />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Warm the cache for the photos either side. */}
            <div aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
              {neighbours.map((n) => (
                <Image key={n} src={photos[n]!.src} alt="" width={1} height={1} sizes="100vw" loading="eager" />
              ))}
            </div>

            {count > 1 ? (
              <>
                <NavButton side="left" label="Previous photo" onClick={() => go(-1)}><ArrowLeft /></NavButton>
                <NavButton side="right" label="Next photo" onClick={() => go(1)}><ArrowRight /></NavButton>
              </>
            ) : null}
          </div>

          <div className="shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            {photo?.alt ? <p className="mx-auto mb-4 max-w-2xl text-center text-sm text-pretty text-white/75">{photo.alt}</p> : null}
            {count > 1 ? (
              <div ref={stripRef} className="mx-auto flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
                {photos.map((p, i) => (
                  <button
                    key={`${p.src}-${i}`}
                    type="button"
                    data-thumb={i}
                    onClick={() => jump(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === current ? "true" : undefined}
                    className={cn(
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-[4px] outline-none transition-[opacity,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-white sm:h-14 sm:w-20",
                      i === current ? "opacity-100 ring-1 ring-white" : "opacity-40 hover:opacity-80",
                    )}
                  >
                    <Image src={p.src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NavButton({ side, label, onClick, children }: { side: "left" | "right"; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none max-sm:hidden [&_svg]:size-5",
        side === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6",
      )}
    >
      {children}
    </button>
  );
}
