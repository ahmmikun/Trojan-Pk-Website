"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/* ---------- Dropdown menu ---------- */

export function DropdownMenu({ trigger, label, children, align = "end" }: { trigger: React.ReactNode; label: string; children: React.ReactNode; align?: "start" | "end" }) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={label} className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-zinc-100 data-popup-open:text-zinc-900 [&_svg]:size-4">
        {trigger}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} align={align} className="z-50 outline-none">
          <Menu.Popup className="admin-scope min-w-48 origin-[var(--transform-origin)] rounded-xl border border-zinc-200 bg-white p-1.5 text-[0.8125rem] text-zinc-800 shadow-[var(--shadow-pop)] outline-none transition-[opacity,scale] duration-100 data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
            {children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

const itemClass =
  "flex h-8 cursor-default items-center gap-2.5 rounded-lg px-2.5 outline-none select-none data-highlighted:bg-zinc-100 data-highlighted:text-zinc-950 data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:text-zinc-500";

export function MenuItem({ children, onClick, danger, disabled }: { children: React.ReactNode; onClick?: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <Menu.Item onClick={onClick} disabled={disabled} className={cn(itemClass, danger && "text-red-700 [&_svg]:text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-700")}>
      {children}
    </Menu.Item>
  );
}

export function MenuLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Menu.LinkItem
      render={external ? <a href={href} target="_blank" rel="noopener noreferrer" /> : <Link href={href} />}
      className={itemClass}
    >
      {children}
    </Menu.LinkItem>
  );
}

export function MenuSeparator() {
  return <Menu.Separator className="-mx-1.5 my-1.5 h-px bg-zinc-200" />;
}

/* ---------- Dialog ---------- */

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup
          className={cn(
            "admin-scope fixed top-1/2 left-1/2 z-50 flex max-h-[min(88dvh,52rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-foreground shadow-[var(--shadow-pop)] outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            size === "md" && "max-w-lg",
            size === "lg" && "max-w-3xl",
            size === "xl" && "max-w-5xl",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-[0.9375rem] font-[600] text-zinc-950">{title}</DialogPrimitive.Title>
              {description ? <DialogPrimitive.Description className="mt-0.5 text-[0.8125rem] text-muted-foreground">{description}</DialogPrimitive.Description> : null}
            </div>
            <DialogPrimitive.Close className="-mr-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground" aria-label="Close">
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer ? <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">{footer}</div> : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------- Confirm ---------- */

/** Controlled confirmation for destructive actions. `onConfirm` may throw; its message is shown inline. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => (setError(null), onOpenChange(o))}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="admin-scope fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-5 text-foreground shadow-[var(--shadow-pop)] outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
          <AlertDialog.Title className="text-[0.9375rem] font-[600] text-zinc-950">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</AlertDialog.Description>
          {error ? <p role="alert" className="mt-3 rounded-md bg-[#d92d20]/[0.07] px-3 py-2 text-[0.8125rem] text-[#b42318]">{error}</p> : null}
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Close render={<Button />}>Cancel</AlertDialog.Close>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  try {
                    await onConfirm();
                    onOpenChange(false);
                  } catch (e) {
                    // A redirect() after success is thrown as NEXT_REDIRECT; let Next handle it.
                    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
                    setError((e as Error).message);
                  }
                })
              }
            >
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
