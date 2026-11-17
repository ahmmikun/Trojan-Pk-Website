"use client";

import { Wand2 } from "lucide-react";
import { Field, Input, Select, SwitchRow, Textarea, useCounter } from "@/components/admin-ui/field";
import { cn } from "@/lib/utils";
import { GalleryField } from "../media/gallery-field";
import { MediaField } from "../media/media-field";
import type { Field as FieldDef } from "../resources";
import { MarkdownEditor } from "./markdown-editor";
import { RepeaterField } from "./repeater-field";

/** Stored timestamp → <input type="datetime-local"> value in Pakistan time (UTC+5). */
export function toLocalInput(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : new Date(d.getTime() + 5 * 3600_000).toISOString().slice(0, 16);
}

type Props = {
  field: FieldDef;
  value: unknown;
  error?: string;
  errors: Record<string, string>;
  folder: string;
  onChange: () => void;
  /** Controlled slug (follows the title on new entries). */
  slug?: { value: string; set: (v: string) => void; generate?: () => void; auto?: boolean; prefix?: string; locked?: boolean };
  onTitleInput?: (v: string) => void;
};

function TextControl({ field, value, error, onTitleInput }: Pick<Props, "field" | "value" | "error" | "onTitleInput">) {
  const initial = String(value ?? "");
  const { counter, onLength } = useCounter(initial, field.maxLength);
  const common = {
    name: field.name,
    defaultValue: initial,
    required: field.required,
    placeholder: field.type === "url" ? "https://" : field.placeholder,
  };
  return (
    <Field id={field.name} label={field.label} required={field.required} description={field.description} error={error} aside={field.type === "textarea" || field.prominent ? counter : null}>
      {field.type === "textarea" ? (
        <Textarea {...common} rows={field.maxLength && field.maxLength > 500 ? 5 : 3} onChange={(e) => onLength(e.target.value.length)} />
      ) : (
        <Input
          {...common}
          type={field.type === "url" ? "url" : field.type === "email" ? "email" : "text"}
          inputMode={field.type === "url" ? "url" : undefined}
          autoComplete="off"
          onChange={(e) => {
            onLength(e.target.value.length);
            onTitleInput?.(e.target.value);
          }}
          className={cn(field.prominent && "h-10 text-[0.9375rem] font-medium")}
        />
      )}
    </Field>
  );
}

/** Renders one resource field with the right control. Every control posts under `field.name`. */
export function FormField({ field, value, error, errors, folder, onChange, slug, onTitleInput }: Props) {
  switch (field.type) {
    case "boolean":
      return <SwitchRow name={field.name} label={field.label} description={error ?? field.description} defaultChecked={Boolean(value)} onCheckedChange={onChange} />;
    case "image":
      return (
        <div id={field.name}>
          <MediaField name={field.name} label={field.label} defaultValue={typeof value === "string" ? value : null} folder={folder} description={field.description} error={error} aspect={field.name === "photo" || field.name === "avatar" ? "portrait" : field.name === "seo_image" ? "wide" : field.name === "logo" ? "square" : "video"} onChange={onChange} />
        </div>
      );
    case "repeater":
      return <RepeaterField field={field} defaultValue={value} folder={folder} errors={errors} onChange={onChange} />;
    case "markdown":
      return (
        <Field id={field.name} label={field.label} required={field.required} description={field.description} error={error}>
          <MarkdownEditor id={field.name} name={field.name} defaultValue={String(value ?? "")} required={field.required} invalid={Boolean(error)} describedBy={error || field.description ? `${field.name}-hint` : undefined} onChange={onChange} folder={folder} />
        </Field>
      );
    case "select":
      return (
        <Field id={field.name} label={field.label} required={field.required} description={field.description} error={error}>
          <Select name={field.name} defaultValue={String(value ?? "")} required={field.required}>
            {!field.required ? <option value="">Not set</option> : null}
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Field>
      );
    case "datetime":
      return (
        <Field id={field.name} label={field.label} required={field.required} description={field.description ?? "Pakistan time (PKT, UTC+5)"} error={error}>
          <Input type="datetime-local" name={field.name} defaultValue={toLocalInput(value)} required={field.required} className="tabular-nums" />
        </Field>
      );
    case "date":
      return (
        <Field id={field.name} label={field.label} required={field.required} description={field.description} error={error}>
          <Input type="date" name={field.name} defaultValue={toLocalInput(value).slice(0, 10)} required={field.required} onChange={onChange} className="tabular-nums" />
        </Field>
      );
    case "gallery":
      return <GalleryField name={field.name} label={field.label} defaultValue={value} folder={folder} description={field.description} error={error} max={field.max} onChange={onChange} />;
    case "number":
      return (
        <Field id={field.name} label={field.label} required={field.required} description={field.description} error={error}>
          <Input type="number" inputMode="numeric" step={1} min={field.min} max={field.max} name={field.name} defaultValue={value === null || value === undefined ? "" : String(value)} className="tabular-nums" />
        </Field>
      );
    case "tags":
      return (
        <Field id={field.name} label={field.label} required={field.required} description={field.description ?? "Separate with commas."} error={error}>
          <Input name={field.name} defaultValue={Array.isArray(value) ? value.join(", ") : ""} placeholder={field.placeholder} autoComplete="off" />
        </Field>
      );
    case "slug":
      return (
        <Field
          id={field.name}
          label={field.label}
          required={field.required}
          description={slug?.locked ? "Set when the entry was created." : slug?.auto ? "Created from the title as you type. Edit it to set your own." : field.description}
          error={error}
          aside={
            slug?.generate && !slug.locked ? (
              <button type="button" onClick={slug.generate} className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline" title="Create the URL from the title">
                <Wand2 className="size-3" aria-hidden="true" />
                From title
              </button>
            ) : null
          }
        >
          <div className="flex min-w-0 items-stretch overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15">
            {slug?.prefix ? <span className="flex shrink-0 items-center border-r border-border bg-muted/50 px-2 text-xs text-muted-foreground">{slug.prefix}</span> : null}
            <input
              id={field.name}
              name={field.name}
              value={slug?.value ?? ""}
              readOnly={slug?.locked}
              onChange={(e) => slug?.set(e.target.value)}
              onBlur={(e) => !slug?.locked && e.target.value.endsWith("-") && slug?.set(e.target.value.replace(/-+$/, ""))}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={`${field.name}-hint`}
              className="h-8 min-w-0 flex-1 bg-transparent px-2 text-[0.8125rem] outline-none read-only:text-muted-foreground"
            />
            {slug?.auto ? <span className="flex shrink-0 items-center pr-2 text-[0.625rem] font-[650] tracking-wide text-emerald-700 uppercase">Auto</span> : null}
          </div>
        </Field>
      );
    default:
      return <TextControl field={field} value={value} error={error} onTitleInput={onTitleInput} />;
  }
}
