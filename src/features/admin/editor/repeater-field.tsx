"use client";

import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/admin-ui/button";
import { controlClass } from "@/components/admin-ui/field";
import { cn } from "@/lib/utils";
import { MediaField } from "../media/media-field";
import type { Field } from "../resources";

type Row = Record<string, string> & { _key: string };

const key = () => crypto.randomUUID();

/** Editable list of small records (links, contributors, milestones, photos), submitted as JSON. */
export function RepeaterField({ field, defaultValue, folder, errors, onChange }: { field: Field; defaultValue: unknown; folder: string; errors: Record<string, string>; onChange?: () => void }) {
  const subs = field.fields ?? [];
  const blank = (): Row => ({ _key: key(), ...Object.fromEntries(subs.map((s) => [s.name, ""])) });
  const [rows, setRows] = useState<Row[]>(() =>
    Array.isArray(defaultValue)
      ? defaultValue.map((r) => ({ _key: key(), ...Object.fromEntries(subs.map((s) => [s.name, String((r as Record<string, unknown>)?.[s.name] ?? "").slice(0, s.type === "date" ? 10 : undefined)])) }))
      : [],
  );
  const singular = field.label.replace(/s$/, "").toLowerCase();

  const update = (next: Row[]) => (setRows(next), onChange?.());
  const set = (i: number, name: string, value: string) => update(rows.map((r, j) => (j === i ? { ...r, [name]: value } : r)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    update(next);
  };
  const serialised = JSON.stringify(rows.map(({ _key, ...r }) => (void _key, r)));
  const rowErrors = (i: number) => subs.map((s) => errors[`${field.name}.${i}.${s.name}`]).filter(Boolean);

  return (
    <fieldset id={field.name} className="flex min-w-0 flex-col gap-2">
      <legend className="sr-only">{field.label}</legend>
      <input type="hidden" name={field.name} value={serialised} />
      {rows.length ? (
        <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
          {rows.map((row, i) => (
            <li key={row._key} className="flex gap-2 p-2.5">
              <GripVertical className="mt-[1.6rem] size-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[repeat(6,minmax(0,1fr))]">
                {subs.map((s) => {
                  const err = errors[`${field.name}.${i}.${s.name}`];
                  const span = s.width === "wide" || subs.length === 1 ? "sm:col-span-4" : s.type === "image" ? "sm:col-span-2" : subs.length >= 4 ? "sm:col-span-3" : "sm:col-span-2";
                  return (
                    <label key={s.name} className={cn("flex min-w-0 flex-col gap-1", span, subs.length >= 4 && s.width === "wide" && "sm:col-span-6")}>
                      <span className="text-[0.6875rem] font-medium text-muted-foreground">{s.label}</span>
                      {s.type === "image" ? (
                        <MediaField compact name={`${field.name}__${i}__${s.name}`} label={s.label} defaultValue={row[s.name]} folder={folder} onChange={(v) => set(i, s.name, v)} />
                      ) : (
                        <input
                          type={s.type === "date" ? "date" : s.type === "url" ? "url" : "text"}
                          value={row[s.name]}
                          placeholder={s.type === "url" ? "https://" : s.placeholder}
                          aria-invalid={err ? true : undefined}
                          onChange={(e) => set(i, s.name, e.target.value)}
                          className={cn(controlClass, "h-8")}
                        />
                      )}
                    </label>
                  );
                })}
                {rowErrors(i).length ? <p className="text-xs text-[#b42318] sm:col-span-6">{rowErrors(i).join(" ")}</p> : null}
              </div>
              <div className="mt-[1.15rem] flex shrink-0 items-start gap-px">
                <Button size="icon-sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${singular} ${i + 1} up`}><ArrowUp aria-hidden="true" /></Button>
                <Button size="icon-sm" variant="ghost" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${singular} ${i + 1} down`}><ArrowDown aria-hidden="true" /></Button>
                <Button size="icon-sm" variant="danger-ghost" onClick={() => update(rows.filter((_, j) => j !== i))} aria-label={`Remove ${singular} ${i + 1}`}><Trash2 aria-hidden="true" /></Button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-md border border-dashed border-input px-4 py-5 text-center text-[0.8125rem] text-muted-foreground">No {field.label.toLowerCase()} yet.</p>
      )}
      <div>
        <Button size="sm" disabled={rows.length >= 50} onClick={() => update([...rows, blank()])}>
          <Plus aria-hidden="true" />
          Add {singular}
        </Button>
      </div>
      {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}
    </fieldset>
  );
}
