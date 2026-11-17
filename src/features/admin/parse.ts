import "server-only";
import { supabaseEnv } from "@/lib/supabase/env";
import { allFields, type Field, type Resource, type SubField } from "./resources";

/**
 * Submitted form data → database values, field by field, with per-field messages.
 * The database checks the same rules again (constraints + RLS); this layer exists so
 * the editor can point at the exact field.
 */

export type FieldErrors = Record<string, string>;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const KEY_RE = /^[a-z0-9_-]{1,60}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Site times are Pakistan Standard Time (UTC+5, no daylight saving). */
export const PKT_OFFSET = "+05:00";

export function httpsUrl(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes(".") ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Images must be a file in /public or an upload in the Supabase media bucket (the only sources the image optimizer allows). */
export function validImage(value: string): boolean {
  if (value.includes("..")) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  const env = supabaseEnv();
  return Boolean(env && value.startsWith(`${env.url}/storage/v1/object/public/media/`));
}

function parseSub(field: Field, sub: SubField, raw: unknown, row: number, errors: FieldErrors): string | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const at = `${field.name}.${row}.${sub.name}`;
  if (sub.type === "url" && !httpsUrl(value)) errors[at] = `Row ${row + 1}: use a full https:// link.`;
  if (sub.type === "date" && !DATE_RE.test(value)) errors[at] = `Row ${row + 1}: pick a date.`;
  if (sub.type === "image" && !validImage(value)) errors[at] = `Row ${row + 1}: upload an image or choose one from the library.`;
  return value.slice(0, 1000);
}

function parseField(resource: Resource, field: Field, form: FormData, errors: FieldErrors, isNew: boolean): unknown {
  const raw = form.get(field.name);
  const text = typeof raw === "string" ? raw.trim() : "";
  const fail = (message: string) => {
    errors[field.name] = message;
    return undefined;
  };

  if (field.type === "boolean") return raw === "on" || raw === "true";

  if (field.type === "repeater") {
    let rows: unknown;
    try {
      rows = JSON.parse(text || "[]");
    } catch {
      return fail("This list could not be read. Reload the page and try again.");
    }
    if (!Array.isArray(rows) || rows.length > 50) return fail("Up to 50 rows.");
    return rows
      .map((r, i) => Object.fromEntries((field.fields ?? []).map((sub) => [sub.name, parseSub(field, sub, (r as Record<string, unknown>)?.[sub.name], i, errors)])))
      .filter((r) => Object.values(r).some((v) => v !== null));
  }

  // A chosen primary key (stats.key, social_links.id) is set once and never changed.
  const isKey = resource.idKind === "key" && field.name === resource.idColumn;
  if (isKey && !isNew) return undefined;

  if (!text) {
    if (field.required) return fail(`${field.label} is required.`);
    if (field.type === "tags") return [];
    return field.type === "textarea" || field.type === "markdown" ? "" : null;
  }

  if (field.maxLength && text.length > field.maxLength) return fail(`Keep it under ${field.maxLength} characters (currently ${text.length}).`);
  const custom = field.validate?.(text);
  if (custom) return fail(custom);

  switch (field.type) {
    case "slug":
      return (isKey ? KEY_RE : SLUG_RE).test(text) ? text : fail(isKey ? "Lowercase letters, numbers, hyphens and underscores only." : "Lowercase letters, numbers and single hyphens, e.g. build-weekend-2027.");
    case "url":
      return httpsUrl(text) ?? fail("Use a full https:// link.");
    case "email":
      return EMAIL_RE.test(text) ? text.toLowerCase() : fail("Enter a valid email address.");
    case "image":
      return validImage(text) ? text : fail("Upload an image, choose one from the library, or use a path in /public.");
    case "select":
      return field.options?.some((o) => o.value === text) ? text : fail("Choose one of the options.");
    case "number": {
      const n = Number(text);
      if (!Number.isInteger(n)) return fail("Use a whole number.");
      if (field.min !== undefined && n < field.min) return fail(`Minimum is ${field.min}.`);
      if (field.max !== undefined && n > field.max) return fail(`Maximum is ${field.max}.`);
      return n;
    }
    case "datetime":
      return DATETIME_RE.test(text) ? `${text}:00${PKT_OFFSET}` : fail("Pick a date and time.");
    case "tags":
      return [...new Set(text.split(/[,\n]/).map((t) => t.trim()).filter(Boolean))].slice(0, 30).map((t) => t.slice(0, 60));
    default:
      return text.slice(0, field.maxLength ?? 50000);
  }
}

export function parseForm(resource: Resource, form: FormData, isNew: boolean): { values: Record<string, unknown>; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const values: Record<string, unknown> = {};
  for (const field of allFields(resource)) {
    const v = parseField(resource, field, form, errors, isNew);
    if (v !== undefined) values[field.name] = v;
  }
  if (typeof values.starts_at === "string" && typeof values.ends_at === "string" && values.ends_at < values.starts_at) {
    errors.ends_at = "Ends before it starts.";
  }
  if ("sort_order" in values && values.sort_order === null) values.sort_order = 0;
  return { values, errors };
}

/** Database error → message the editor can show (unique slug, check constraint, permission). */
export function describeDbError(resource: Resource, error: { code?: string; message: string }): { field?: string; message: string } {
  if (error.code === "23505") {
    const field = resource.idKind === "key" && !error.message.includes("slug") ? resource.idColumn : "slug";
    return { field, message: "Already used by another entry. Choose a different one." };
  }
  if (error.code === "23514") return { message: "A value is not allowed. Check links (https only), dates and lengths." };
  if (error.code === "42501") return { message: "Your account is not allowed to make this change." };
  return { message: `Could not save: ${error.message}` };
}
