"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, CornerDownLeft, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Kbd } from "@/components/admin-ui/display";
import { cn } from "@/lib/utils";
import { RESOURCES } from "../resources";
import { ADMIN_NAV } from "./nav";

type Command = { id: string; label: string; hint: string; href: string; icon: React.ReactNode };

/** ⌘K / Ctrl+K: jump to any section or start a new entry from anywhere in the admin. */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const commands = useMemo<Command[]>(() => {
    const go = ADMIN_NAV.flatMap((g) => g.items).map((i) => ({ id: `go-${i.href}`, label: i.label, hint: "Go to", href: i.href, icon: <i.icon className="size-4" aria-hidden="true" /> }));
    const create = Object.values(RESOURCES).map((r) => ({ id: `new-${r.key}`, label: `New ${r.singular.toLowerCase()}`, hint: "Create", href: `/admin/${r.key}/new`, icon: <Plus className="size-4" aria-hidden="true" /> }));
    return [...go, ...create];
  }, []);

  const results = commands.filter((c) => !query || `${c.hint} ${c.label}`.toLowerCase().includes(query.toLowerCase().trim()));
  const run = (c: Command | undefined) => {
    if (!c) return;
    onOpenChange(false);
    router.push(c.href);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setQuery("");
          setActive(0);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/25 transition-opacity duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="admin-scope fixed top-[14vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl shadow-black/20 outline-none transition-[opacity,scale] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") e.preventDefault();
                if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
                if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
                if (e.key === "Enter") run(results[active]);
              }}
              placeholder="Go to or create…"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-results"
              aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id="command-results" role="listbox" className="max-h-80 overflow-y-auto p-1.5">
            {results.length === 0 ? <li className="px-3 py-8 text-center text-[0.8125rem] text-muted-foreground">No matches.</li> : null}
            {results.map((c, i) => (
              <li
                key={c.id}
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => run(c)}
                className={cn("flex h-9 cursor-default items-center gap-3 rounded-md px-2.5 text-[0.8125rem]", i === active && "bg-foreground/[0.05]")}
              >
                <span className="text-muted-foreground">{c.icon}</span>
                <span className="flex-1 truncate">{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.hint}</span>
                {i === active ? <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden="true" /> : <ArrowRight className="size-3.5 opacity-0" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
