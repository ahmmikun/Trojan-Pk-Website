"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; count?: number };

type FilterGroupProps = {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  allLabel?: string;
};

/** Single-select chip group (toggle off by selecting again / "All"). */
export function FilterGroup({ label, options, value, onChange, allLabel = "All" }: FilterGroupProps) {
  const btn = (active: boolean) =>
    cn(
      "rounded-md border px-3 py-1.5 text-sm transition-colors",
      active ? "border-brand-blue/50 bg-brand-blue/15 text-foreground" : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground",
    );
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={btn(value === null)}>
        {allLabel}
      </button>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(value === o.value ? null : o.value)} className={btn(value === o.value)}>
          {o.label}
          {o.count !== undefined ? <span className="ml-1.5 font-mono text-xs text-muted-foreground">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

type SearchProps = { value: string; onChange: (v: string) => void; label: string; placeholder: string };

export function SearchField({ value, onChange, label, placeholder }: SearchProps) {
  const id = useId();
  return (
    <div className="relative w-full max-w-md">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 w-full rounded-md border border-input bg-surface pr-9 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
