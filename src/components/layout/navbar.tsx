"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ButtonLink } from "@/components/common/button-link";
import { Logo } from "@/components/common/logo";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
    <ul className="flex items-center gap-1">
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("relative rounded-md px-3 py-2 text-sm transition-colors hover:text-foreground", active ? "text-foreground" : "text-muted-foreground")}
            >
              {item.label}
              {active ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-[17px] h-px bg-brand-blue" /> : null}
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

function MobileItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col">
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            {/* Plain links (not Dialog.Close) so assistive tech announces them as links. */}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn("flex items-center justify-between rounded-md px-3 py-3 text-base transition-colors hover:bg-white/5", active ? "text-foreground" : "text-muted-foreground")}
            >
              {item.label}
              {active ? <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-blue" /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveMobileItems({ onNavigate }: { onNavigate: () => void }) {
  return <MobileItems pathname={usePathname()} onNavigate={onNavigate} />;
}

export function Navbar({ socialLinks }: { socialLinks: ResolvedSocialLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-200",
        scrolled ? "border-border bg-background/85 backdrop-blur-md" : "border-transparent bg-background/0",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <Suspense fallback={<DesktopItems pathname="" />}>
            <ActiveDesktopItems />
          </Suspense>
        </nav>

        <div className="flex items-center gap-3">
          <SocialIconLinks links={socialLinks} only={["github", "discord"]} size="sm" className="hidden xl:flex" aria-label="Community links" />
          <ButtonLink href={joinCta.href} emphasis size="sm" className="hidden sm:inline-flex">
            {joinCta.label}
          </ButtonLink>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "lg:hidden")} aria-label="Open navigation menu">
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,22rem)] gap-0 bg-background">
              <SheetHeader className="border-b border-border p-5">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">Site navigation and community links</SheetDescription>
                <Logo href={null} />
              </SheetHeader>
              <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3">
                <Suspense fallback={<MobileItems pathname="" onNavigate={close} />}>
                  <ActiveMobileItems onNavigate={close} />
                </Suspense>
              </nav>
              <div className="flex flex-col gap-4 border-t border-border p-5">
                <ButtonLink href={joinCta.href} emphasis className="w-full" onClick={close}>
                  {joinCta.label}
                </ButtonLink>
                <SocialIconLinks links={socialLinks} aria-label="Social links" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
