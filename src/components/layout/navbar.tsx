"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/common/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { joinCta, mainNav } from "@/config/site";
import { cn } from "@/lib/utils";
import type { ResolvedSocialLink } from "@/types/social";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/* The pathname is runtime data, so everything that depends on it lives behind
   a Suspense boundary; the fallback renders the same links with no active state. */

function DesktopItems({ pathname }: { pathname: string }) {
  return (
    <ul className="flex items-center gap-8">
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("text-sm transition-opacity duration-300 hover:opacity-100", active ? "opacity-100" : "opacity-60")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveDesktopItems() {
  return <DesktopItems pathname={usePathname()} />;
}

/**
 * Transparent editorial header. It floats over the page (position: fixed) and
 * uses mix-blend-difference, so white text inverts against whatever is behind
 * it and stays legible on dark and light sections in either theme.
 * Hides while scrolling down, returns on scroll up.
 */
export function Navbar({ socialLinks }: { socialLinks: ResolvedSocialLink[] }) {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 160 && y > prev);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 text-white mix-blend-difference"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>
      <div className="mx-auto grid h-[var(--nav-h)] w-full max-w-[100rem] grid-cols-[1fr_auto] items-center gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <div className="justify-self-start">
          <Logo />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <Suspense fallback={<DesktopItems pathname="" />}>
            <ActiveDesktopItems />
          </Suspense>
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          <ThemeToggle className="size-9 rounded-full border-0 bg-transparent text-current opacity-70 hover:bg-transparent hover:opacity-100 dark:bg-transparent dark:hover:bg-transparent" />
          <Link
            href={joinCta.href}
            className="group hidden h-9 items-center gap-1.5 rounded-full bg-white pr-3 pl-4 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03] sm:inline-flex"
          >
            {joinCta.label}
            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <MobileMenu socialLinks={socialLinks} />
        </div>
      </div>
    </motion.header>
  );
}
