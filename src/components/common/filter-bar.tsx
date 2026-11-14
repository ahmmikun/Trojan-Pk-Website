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

/** Single-select pill group (toggle off by selecting again / "All"). */
export function FilterGroup({ label, options, value, onChange, allLabel = "All" }: FilterGroupProps) {
  const btn = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors duration-300",
      active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
    );
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={btn(value === null)}>
        {allLabel}
      </button>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(value === o.value ? null : o.value)} className={btn(value === o.value)}>
          {o.label}
          {o.count !== undefined ? <sup className="tabular ml-1 font-mono text-[10px] opacity-60">{o.count}</sup> : null}
        </button>
      ))}
    </div>
  );
}

type SearchProps = { value: string; onChange: (v: string) => void; label: string; placeholder: string };

/** Underlined search field. */
export function SearchField({ value, onChange, label, placeholder }: SearchProps) {
  const id = useId();
  return (
    <div className="relative w-full max-w-md">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-full border-0 border-b border-input bg-transparent pr-8 pl-7 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="absolute top-1/2 right-0 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

/** Live result count shown above filtered lists. */
export function ResultCount({ count, noun }: { count: number; noun: string }) {
  return (
    <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
      {count} {count === 1 ? noun : `${noun}s`}
    </p>
  );
}
