"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { ChevronRight, ChevronsUpDown, ExternalLink, LogOut, Menu as MenuIcon, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Kbd } from "@/components/admin-ui/display";
import { cn } from "@/lib/utils";
import { signOut } from "../auth-actions";
import { CommandPalette } from "./command-palette";
import { ADMIN_NAV, navFor } from "./nav";

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="grid size-8 place-items-center rounded-lg bg-zinc-900 shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.12)]">
        <Image src="/brand/mark.png" alt="" width={15} height={18} className="h-[18px] w-[15px]" />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.8125rem] font-[650] tracking-[-0.01em] text-zinc-950">Trojans PK</span>
        <span className="block text-[0.6875rem] text-zinc-500">Admin console</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = navFor(pathname)?.href;
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {ADMIN_NAV.map((section, i) => (
        <div key={section.group ?? i}>
          {section.group ? <p className="mb-1.5 px-3 text-[0.6875rem] font-[600] tracking-[0.06em] text-zinc-400 uppercase">{section.group}</p> : null}
          <ul className="flex flex-col gap-0.5">
            {section.items.map(({ href, label, icon: Icon }) => {
              const isActive = active === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    prefetch
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[0.8125rem] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? "bg-zinc-100 font-[600] text-zinc-950" : "font-[500] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
                    )}
                  >
                    {isActive ? <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-zinc-900" aria-hidden="true" /> : null}
                    <Icon className={cn("size-[1.0625rem] shrink-0 transition-colors", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600")} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AccountMenu({ email }: { email: string }) {
  return (
    <Menu.Root>
      <Menu.Trigger className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-2 text-left shadow-[0_1px_2px_rgb(16_24_40/0.04)] outline-none transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-zinc-50">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 text-xs font-[600] text-white uppercase" aria-hidden="true">{email.slice(0, 1)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8125rem] font-[600] text-zinc-900">{email}</span>
          <span className="block text-[0.6875rem] text-zinc-500">Administrator</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="start" sideOffset={8} className="z-50">
          <Menu.Popup className="admin-scope w-[var(--anchor-width)] min-w-56 rounded-xl border border-zinc-200 bg-white p-1.5 text-[0.8125rem] text-zinc-800 shadow-[var(--shadow-pop)] outline-none transition-[opacity,scale] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
            <Menu.LinkItem render={<a href="/" target="_blank" rel="noopener noreferrer" />} className="flex h-8 items-center gap-2.5 rounded-lg px-2.5 outline-none data-highlighted:bg-zinc-100 [&_svg]:size-4 [&_svg]:text-zinc-500">
              <ExternalLink aria-hidden="true" />
              View website
              <span className="sr-only">(opens in a new tab)</span>
            </Menu.LinkItem>
            <Menu.Separator className="-mx-1.5 my-1.5 h-px bg-zinc-200" />
            <Menu.Item onClick={() => void signOut()} className="flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-red-700 outline-none data-highlighted:bg-red-50 [&_svg]:size-4 [&_svg]:text-red-600">
              <LogOut aria-hidden="true" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function SidebarBody({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-4">
        <Brand />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-zinc-200 p-3">
        <AccountMenu email={email} />
      </div>
    </>
  );
}

/** Desktop sidebar. */
export function AdminSidebar({ email }: { email: string }) {
  return <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">{<SidebarBody email={email} />}</aside>;
}

/** Top bar on every admin screen: menu (mobile), breadcrumbs, search, view site. */
export function AdminTopbar({ email }: { email: string }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const section = navFor(pathname);
  const parts = pathname.split("/").filter(Boolean);
  const leaf = parts.length > 2 ? (parts[2] === "new" ? "New" : "Edit") : null;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 sm:px-6 lg:px-8">
        <Dialog.Root open={drawer} onOpenChange={setDrawer}>
          <Dialog.Trigger className="-ml-1 grid size-9 place-items-center rounded-lg text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 lg:hidden" aria-label="Open navigation">
            <MenuIcon className="size-[1.125rem]" aria-hidden="true" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <Dialog.Popup className="admin-scope fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white text-foreground shadow-[var(--shadow-pop)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <Dialog.Close className="absolute top-4 right-3 grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100" aria-label="Close navigation">
                <X className="size-4" aria-hidden="true" />
              </Dialog.Close>
              <SidebarBody email={email} onNavigate={() => setDrawer(false)} />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
            <li className="hidden shrink-0 sm:block">
              <Link href="/admin" className="text-zinc-500 hover:text-zinc-900">Admin</Link>
            </li>
            {section && section.href !== "/admin" ? (
              <>
                <li className="hidden sm:block" aria-hidden="true"><ChevronRight className="size-3.5 text-zinc-300" /></li>
                <li className="min-w-0 truncate">
                  <Link href={section.href} aria-current={leaf ? undefined : "page"} className={cn("truncate", leaf ? "text-zinc-500 hover:text-zinc-900" : "font-[600] text-zinc-900")}>{section.label}</Link>
                </li>
              </>
            ) : (
              <>
                <li className="hidden sm:block" aria-hidden="true"><ChevronRight className="size-3.5 text-zinc-300" /></li>
                <li className="font-[600] text-zinc-900" aria-current="page">Overview</li>
              </>
            )}
            {leaf ? (
              <>
                <li aria-hidden="true"><ChevronRight className="size-3.5 text-zinc-300" /></li>
                <li className="font-[600] text-zinc-900" aria-current="page">{leaf}</li>
              </>
            ) : null}
          </ol>
        </nav>

        <button
          type="button"
          onClick={() => setPalette(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-white px-2.5 text-[0.8125rem] text-zinc-500 shadow-[0_1px_2px_rgb(16_24_40/0.05)] ring-1 ring-zinc-300 outline-none ring-inset transition-colors hover:bg-zinc-50 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
          aria-label="Search and commands"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden flex-1 text-left sm:block">Search or jump to…</span>
          <span className="hidden sm:inline-flex"><Kbd>Ctrl K</Kbd></span>
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[0.8125rem] font-[550] text-zinc-700 ring-1 ring-zinc-300 ring-inset transition-colors hover:bg-zinc-50 hover:text-zinc-950 md:inline-flex"
        >
          View site
          <ExternalLink className="size-3.5 text-zinc-400" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </header>
      <CommandPalette open={palette} onOpenChange={setPalette} />
    </>
  );
}
