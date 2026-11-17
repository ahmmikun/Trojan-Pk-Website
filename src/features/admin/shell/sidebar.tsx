"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { ChevronsUpDown, ExternalLink, LogOut, Menu as MenuIcon, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Kbd } from "@/components/admin-ui/display";
import { cn } from "@/lib/utils";
import { signOut } from "../auth-actions";
import { CommandPalette } from "./command-palette";
import { ADMIN_NAV } from "./nav";

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
      <span className="grid size-7 place-items-center rounded-md bg-foreground">
        <Image src="/brand/mark.png" alt="" width={14} height={17} className="h-[17px] w-3.5" />
      </span>
      <span className="text-[0.8125rem] leading-tight font-medium">
        Trojans PK
        <span className="block text-[0.6875rem] font-normal text-muted-foreground">Content workspace</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {ADMIN_NAV.map((section, i) => (
        <div key={section.group ?? i}>
          {section.group ? <p className="mb-1 px-2 text-[0.6875rem] font-medium text-muted-foreground">{section.group}</p> : null}
          <ul className="flex flex-col gap-px">
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-md px-2 text-[0.8125rem] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                      active ? "bg-background font-medium text-foreground shadow-xs ring-1 ring-border" : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")} aria-hidden="true" />
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
      <Menu.Trigger className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left outline-none transition-colors hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring/60 data-popup-open:bg-foreground/[0.04]">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-[0.6875rem] font-medium text-background uppercase" aria-hidden="true">{email.slice(0, 1)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8125rem] font-medium">{email}</span>
          <span className="block text-[0.6875rem] text-muted-foreground">Admin</span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="start" sideOffset={6} className="z-50">
          <Menu.Popup className="admin-scope w-56 rounded-lg border border-border bg-background p-1 text-[0.8125rem] text-foreground shadow-lg shadow-black/[0.08] outline-none transition-[opacity,scale] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
            <Menu.LinkItem render={<a href="/" target="_blank" rel="noopener noreferrer" />} className="flex h-8 items-center gap-2 rounded-md px-2 outline-none data-highlighted:bg-foreground/[0.05] [&_svg]:size-4 [&_svg]:text-muted-foreground">
              <ExternalLink aria-hidden="true" />
              View site
              <span className="sr-only">(opens in a new tab)</span>
            </Menu.LinkItem>
            <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
            <Menu.Item onClick={() => void signOut()} className="flex h-8 items-center gap-2 rounded-md px-2 outline-none data-highlighted:bg-foreground/[0.05] [&_svg]:size-4 [&_svg]:text-muted-foreground">
              <LogOut aria-hidden="true" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-background px-2 text-[0.8125rem] text-muted-foreground shadow-xs outline-none transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60">
      <Search className="size-3.5" aria-hidden="true" />
      <span className="flex-1 text-left">Search</span>
      <Kbd>Ctrl K</Kbd>
    </button>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  const content = (onNavigate?: () => void) => (
    <>
      <div className="flex flex-col gap-4 px-2">
        <Brand />
        <SearchButton onClick={() => (onNavigate?.(), setPalette(true))} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-border px-2 pt-2">
        <AccountMenu email={email} />
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-5 border-r border-border bg-sidebar py-4 lg:flex">{content()}</aside>

      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPalette(true)} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05]" aria-label="Search">
            <Search className="size-4" aria-hidden="true" />
          </button>
          <Dialog.Root open={drawer} onOpenChange={setDrawer}>
            <Dialog.Trigger className="grid size-8 place-items-center rounded-md hover:bg-foreground/[0.05]" aria-label="Open admin menu">
              <MenuIcon className="size-4" aria-hidden="true" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
              <Dialog.Popup className="admin-scope fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-5 border-r border-border bg-sidebar py-4 text-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
                <Dialog.Title className="sr-only">Admin menu</Dialog.Title>
                <Dialog.Close className="absolute top-4 right-3 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-foreground/[0.05]" aria-label="Close menu">
                  <X className="size-4" aria-hidden="true" />
                </Dialog.Close>
                {content(() => setDrawer(false))}
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      <CommandPalette open={palette} onOpenChange={setPalette} />
    </>
  );
}
