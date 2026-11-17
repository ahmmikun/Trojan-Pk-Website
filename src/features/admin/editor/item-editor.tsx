"use client";

import { Tabs } from "@base-ui/react/tabs";
import { ChevronLeft, Copy, ExternalLink, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/admin-ui/button";
import { formatDate, Kbd, PublishStatus, relativeTime } from "@/components/admin-ui/display";
import { ConfirmDialog, DropdownMenu, MenuItem, MenuLink, MenuSeparator } from "@/components/admin-ui/overlay";
import { toast } from "@/components/admin-ui/toast";
import { cn } from "@/lib/utils";
import { deleteItem, duplicateItem, saveItem, type SaveState } from "../actions";
import { allFields, getResource, SEO_FIELDS, type Field } from "../resources";
import { FormField } from "./form-field";
import { SeoPreview } from "./seo-preview";

function toSlug(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const initial: SaveState = { status: "idle", message: null, errors: {} };

type Props = {
  resourceKey: string;
  id: string | null;
  values: Record<string, unknown>;
  siteUrl: string;
  publicHref?: string | null;
  justCreated?: boolean;
};

export function ItemEditor({ resourceKey, id, values, siteUrl, publicHref, justCreated }: Props) {
  const resource = getResource(resourceKey)!;
  const router = useRouter();
  const isNew = id === null;
  const [state, setState] = useState<SaveState>(initial);
  const [pending, startSave] = useTransition();
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("content");

  const slugField = resource.fields.find((f) => f.type === "slug");
  const keyLocked = resource.idKind === "key" && slugField?.name === resource.idColumn && !isNew;
  const [slug, setSlug] = useState(String(values[slugField?.name ?? ""] ?? ""));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [title, setTitle] = useState(String(values[resource.titleField] ?? ""));

  // Dirty tracking without clocks: count edits, remember the count at submit, and mark it saved when the result arrives.
  const [edits, setEdits] = useState(0);
  const [submittedEdits, setSubmittedEdits] = useState(0);
  const [savedEdits, setSavedEdits] = useState(0);
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    // Adjust state while rendering (React's recommended alternative to an effect).
    setSeenState(state);
    if (state.status === "saved") setSavedEdits(submittedEdits);
    if (state.status === "error") {
      const first = Object.keys(state.errors)[0]?.split(".")[0];
      setTab(first && SEO_FIELDS.some((f) => f.name === first) ? "seo" : "content");
    }
  }
  const markDirty = () => setEdits((n) => n + 1);
  const dirty = edits > savedEdits;
  const errors = state.errors;
  const errorEntries = Object.entries(errors);

  // Move focus to the error summary when validation fails.
  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  useEffect(() => {
    if (justCreated) toast.success(`${resource.singular} created`, "It stays a draft until you publish it.");
  }, [justCreated, resource.singular]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        form?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [form]);

  const labelOf = (name: string) => {
    const [base, row] = name.split(".");
    const f = allFields(resource).find((x) => x.name === base);
    return row !== undefined ? `${f?.label ?? base}, row ${Number(row) + 1}` : (f?.label ?? base);
  };

  const render = (f: Field) => (
    <FormField
      key={f.name}
      field={f}
      value={values[f.name]}
      error={errors[f.name]}
      errors={errors}
      folder={resource.key}
      onChange={markDirty}
      slug={f.type === "slug" ? { value: slug, set: (v) => (setSlug(v), setSlugTouched(true), markDirty()), prefix: f.placeholder, locked: keyLocked } : undefined}
      onTitleInput={f.name === resource.titleField ? (v) => (setTitle(v), !slugTouched && slugField?.name === "slug" && setSlug(toSlug(v))) : undefined}
    />
  );

  const grid = (fields: Field[]) => (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={cn("min-w-0", !f.half && "sm:col-span-2")}>{render(f)}</div>
      ))}
    </div>
  );

  const inspector = resource.fields.filter((f) => f.place === "inspector");
  const visibility = inspector.filter((f) => f.type === "boolean");
  const other = inspector.filter((f) => f.type !== "boolean");
  const listHref = `/admin/${resource.key}`;
  const displayTitle = title.trim() || (isNew ? `New ${resource.singular.toLowerCase()}` : "Untitled");

  return (
    <form
      ref={setForm}
      noValidate
      onInput={markDirty}
      onSubmit={(e) => {
        // Submit through a transition (not the `action` prop) so typed values survive a validation error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmittedEdits(edits);
        // Called directly (not via useActionState) so the toast still shows if the refreshed page remounts this form.
        startSave(async () => {
          const result = await saveItem(resourceKey, id, state, data);
          setState(result);
          if (result.status === "saved") toast.success(result.message ?? "Saved");
        });
      }}
      className="flex min-w-0 flex-col gap-6"
    >
      {/* Sticky document header */}
      <div className="sticky top-12 z-20 -mx-4 -mt-6 border-b border-border bg-[var(--canvas)]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href={listHref} className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-xs hover:text-foreground" aria-label={`Back to ${resource.label}`}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] text-muted-foreground">
              <Link href={listHref} className="hover:text-foreground">{resource.label}</Link>
              <span aria-hidden="true"> / </span>
              {isNew ? "New" : "Edit"}
            </p>
            <h1 className="truncate text-[0.9375rem] font-medium">{displayTitle}</h1>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block" aria-live="polite">
            {pending ? "Saving…" : dirty ? "Unsaved changes" : state.status === "saved" ? "Saved just now" : isNew ? "Not saved yet" : `Saved ${relativeTime(values.updated_at).replace(/^Just/, "just")}`}
          </span>
          {!isNew ? (
            <DropdownMenu label="More actions" trigger={<MoreHorizontal aria-hidden="true" />}>
              {publicHref ? (
                <MenuLink href={publicHref} external>
                  <ExternalLink aria-hidden="true" />
                  View on site
                </MenuLink>
              ) : null}
              {resource.idKind === "uuid" ? (
                <MenuItem
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        const r = await duplicateItem(resource.key, id);
                        if (r && !r.ok) toast.error("Could not duplicate", r.error);
                      } catch (e) {
                        if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
                      }
                    })
                  }
                >
                  <Copy aria-hidden="true" />
                  Duplicate as draft
                </MenuItem>
              ) : null}
              <MenuSeparator />
              <MenuItem danger onClick={() => setConfirmDelete(true)}>
                <Trash2 aria-hidden="true" />
                Delete
              </MenuItem>
            </DropdownMenu>
          ) : null}
          <Button type="submit" variant="primary" disabled={pending} className="min-w-20">
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </div>

      {/* Error summary */}
      {state.status === "error" ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-lg border border-[#d92d20]/25 bg-[#d92d20]/[0.05] px-4 py-3 text-[0.8125rem] outline-none">
          <p className="font-medium text-[#b42318]">{state.message}</p>
          {errorEntries.length ? (
            <ul className="mt-1.5 flex flex-col gap-0.5">
              {errorEntries.map(([name, message]) => (
                <li key={name}>
                  <a href={`#${name.split(".")[0]}`} onClick={() => setTab(SEO_FIELDS.some((f) => f.name === name) ? "seo" : "content")} className="text-[#b42318] underline-offset-2 hover:underline">
                    {labelOf(name)}: {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Tabs.Root value={tab} onValueChange={(v) => setTab(String(v))} className="min-w-0">
          {resource.seo ? (
            <Tabs.List className="relative mb-4 flex gap-4 border-b border-border text-[0.8125rem]">
              {[
                { id: "content", label: "Content" },
                { id: "seo", label: "SEO & sharing" },
              ].map((t) => (
                <Tabs.Tab key={t.id} value={t.id} className="relative -mb-px h-9 border-b-2 border-transparent px-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground data-active:border-foreground data-active:font-medium data-active:text-foreground">
                  {t.label}
                  {Object.keys(errors).some((e) => (t.id === "seo") === SEO_FIELDS.some((f) => f.name === e.split(".")[0])) ? <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[#d92d20] align-middle" aria-label="has errors" /> : null}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          ) : null}

          {/* keepMounted: hidden tabs must still submit their fields */}
          <Tabs.Panel value="content" keepMounted className="flex flex-col gap-4 data-hidden:hidden">
            {resource.sections.map((s) => {
              const fields = resource.fields.filter((f) => f.place === s.id);
              if (!fields.length) return null;
              return (
                <section key={s.id} aria-labelledby={`sec-${s.id}`} className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
                  <div className="mb-4">
                    <h2 id={`sec-${s.id}`} className="text-[0.8125rem] font-medium">{s.title}</h2>
                    {s.description ? <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p> : null}
                  </div>
                  {grid(fields)}
                </section>
              );
            })}
          </Tabs.Panel>

          {resource.seo ? (
            <Tabs.Panel value="seo" keepMounted className="data-hidden:hidden">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
                <section className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
                  <div className="mb-4">
                    <h2 className="text-[0.8125rem] font-medium">Search and social</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Optional. Empty fields fall back to the title, summary and cover image.</p>
                  </div>
                  <div className="flex flex-col gap-5">{SEO_FIELDS.map(render)}</div>
                </section>
                <aside className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
                  <SeoPreview form={form} siteUrl={siteUrl} pathPrefix={slugField?.placeholder ?? "/"} titleField={resource.titleField} summaryField={resource.fields.find((f) => f.name === "summary" || f.name === "excerpt")?.name ?? "summary"} imageField={resource.imageField} />
                </aside>
              </div>
            </Tabs.Panel>
          ) : null}
        </Tabs.Root>

        {/* Inspector */}
        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-20">
          <section className="rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-[0.8125rem] font-medium">Visibility</h2>
              {!isNew ? <PublishStatus published={Boolean(values.published)} /> : null}
            </div>
            <div className="flex flex-col gap-4 p-4">{visibility.map(render)}</div>
          </section>
          {other.length ? (
            <section className="rounded-xl border border-border bg-card shadow-xs">
              <h2 className="border-b border-border px-4 py-3 text-[0.8125rem] font-medium">Settings</h2>
              <div className="flex flex-col gap-4 p-4">{other.map(render)}</div>
            </section>
          ) : null}
          {!isNew ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
              <dt>Created</dt>
              <dd className="text-right tabular-nums">{formatDate(values.created_at, { time: true })}</dd>
              <dt>Last saved</dt>
              <dd className="text-right tabular-nums">{formatDate(values.updated_at, { time: true })}</dd>
            </dl>
          ) : null}
          <p className="hidden px-1 text-xs text-muted-foreground xl:block">
            <Kbd>Ctrl</Kbd> <Kbd>S</Kbd> to save
          </p>
        </aside>
      </div>

      {!isNew ? (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Delete “${displayTitle}”?`}
          description="It is removed from the site and the database. This cannot be undone. To hide it instead, turn off Published."
          onConfirm={async () => {
            const r = await deleteItem(resource.key, id, false);
            if (!r.ok) throw new Error(r.error);
            toast.success("Deleted", displayTitle);
            setSavedEdits(edits);
            router.push(listHref);
          }}
        />
      ) : null}
    </form>
  );
}
