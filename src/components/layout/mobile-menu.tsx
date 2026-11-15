"use client";

import { Dialog } from "@base-ui/react/dialog";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { joinCta, mainNav } from "@/config/site";
import { cn } from "@/lib/utils";
import type { ResolvedSocialLink } from "@/types/social";

const EASE = [0.76, 0, 0.24, 1] as const;
const RISE = [0.22, 1, 0.36, 1] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function MenuLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <ul className="mt-auto flex flex-col">
      {mainNav.map((item, i) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} className="-mx-[0.1em] overflow-hidden px-[0.1em] pb-[0.06em]">
            <motion.div
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.8, ease: RISE, delay: 0.32 + i * 0.045 }}
            >
              {/* Plain links (not Dialog.Close) so assistive tech announces them as links. */}
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group inline-flex items-start gap-2 py-0.5 text-[clamp(1.875rem,min(10.5vw,5.6dvh),4.25rem)] leading-[1.04] font-medium tracking-[-0.045em] transition-[color,opacity] duration-300 active:opacity-60",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{item.label}</span>
                <sup aria-hidden="true" className="tabular mt-[0.9em] flex items-center gap-1.5 text-xs font-normal tracking-normal text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                  {active && <span className="size-1.5 rounded-full bg-success" />}
                </sup>
              </Link>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  return <MenuLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

/**
 * Full-screen editorial menu for phones and tablets. The panel unfolds from the
 * top with a clip-path wipe, then each link rises out of its own mask.
 * Built on the Base UI dialog, so focus trapping, Escape and scroll lock work.
 */
export function MobileMenu({ socialLinks }: { socialLinks: ResolvedSocialLink[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex h-9 items-center gap-2.5 pl-2 text-sm lg:hidden" aria-label="Open navigation menu">
        <span aria-hidden="true">Menu</span>
        <span aria-hidden="true" className="flex flex-col gap-[4px]">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Popup
          data-lenis-prevent
          className="fixed inset-0 z-50 flex h-dvh flex-col bg-background text-foreground transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] [clip-path:inset(0_0_0_0)] data-ending-style:[clip-path:inset(0_0_100%_0)] data-starting-style:[clip-path:inset(0_0_100%_0)] motion-reduce:transition-none lg:hidden"
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Description className="sr-only">Site navigation and community links</Dialog.Description>

          <div className="mx-auto flex h-[var(--nav-h)] w-full max-w-7xl shrink-0 items-center justify-between px-5 sm:px-8">
            {/* The mark is white; invert it on the light panel. */}
            <Logo href={null} className="[&_img]:invert dark:[&_img]:invert-0" />
            <Dialog.Close className="inline-flex h-9 items-center gap-2.5 pl-2 text-sm" aria-label="Close navigation menu">
              <span aria-hidden="true">Close</span>
              <span aria-hidden="true" className="relative block size-4">
                <span className="absolute top-1/2 left-0 block h-px w-4 rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 block h-px w-4 -rotate-45 bg-current" />
              </span>
            </Dialog.Close>
          </div>

          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="mx-5 h-px origin-left bg-border sm:mx-8"
          />

          <nav aria-label="Mobile" className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8">
            <Suspense fallback={<MenuLinks pathname="" onNavigate={close} />}>
              <ActiveMenuLinks onNavigate={close} />
            </Suspense>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: RISE, delay: 0.6 }}
            className="mx-auto w-full max-w-7xl shrink-0 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8"
          >
            <Link
              href={joinCta.href}
              onClick={close}
              className="group flex h-14 items-center justify-between rounded-full bg-foreground pr-2 pl-6 text-base font-medium text-background transition-transform duration-300 active:scale-[0.98]"
            >
              {joinCta.label}
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-background text-foreground">
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
              <SocialIconLinks links={socialLinks} size="sm" aria-label="Social links" className="gap-1.5 [&_a]:rounded-full" />
              <ThemeToggle className="size-9 shrink-0 rounded-full" />
            </div>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
