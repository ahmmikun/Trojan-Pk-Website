"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useEffect } from "react";
import { Button } from "@/components/admin-ui/button";
import { Field, Input, Textarea, useCounter } from "@/components/admin-ui/field";
import { toast } from "@/components/admin-ui/toast";
import { saveSettings, type SaveState } from "../actions";
import { MediaField } from "../media/media-field";

export type SettingsValues = { tagline: string; description: string; application_form_url: string | null; default_og_image: string | null };

const initial: SaveState = { status: "idle", message: null, errors: {} };

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-border px-4 py-5 last:border-0 sm:px-5 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-8">
      <div>
        <h3 className="text-[0.8125rem] font-medium">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </div>
  );
}

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, action, pending] = useActionState(saveSettings, initial);
  const desc = useCounter(values.description, 300);
  const tag = useCounter(values.tagline, 80);

  useEffect(() => {
    if (state.status === "saved") toast.success(state.message ?? "Saved");
    if (state.status === "error") toast.error(state.message ?? "Could not save");
  }, [state]);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
    >
      <Row title="Identity" description="Shown in the hero and used as the default description for search engines and link previews.">
        <Field id="tagline" label="Tagline" required error={state.errors.tagline} aside={tag.counter}>
          <Input name="tagline" defaultValue={values.tagline} onChange={(e) => tag.onLength(e.target.value.length)} />
        </Field>
        <Field id="description" label="Site description" required error={state.errors.description} aside={desc.counter} description="One or two sentences. 120–155 characters reads best in search results.">
          <Textarea name="description" rows={3} defaultValue={values.description} onChange={(e) => desc.onLength(e.target.value.length)} />
        </Field>
      </Row>
      <Row title="Membership" description="Where the Apply button on the Join page goes. Leave empty to point visitors to the community channels instead.">
        <Field id="application_form_url" label="Application form link" error={state.errors.application_form_url} description="For example a Google Form. Must start with https://.">
          <Input name="application_form_url" type="url" inputMode="url" defaultValue={values.application_form_url ?? ""} placeholder="https://forms.gle/…" />
        </Field>
      </Row>
      <Row title="Default social image" description="Used when the home page is shared, and by pages without their own image. 1200×630 works best.">
        <MediaField name="default_og_image" label="Image" defaultValue={values.default_og_image} folder="site" aspect="wide" error={state.errors.default_og_image} />
      </Row>
      <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-4 py-3 sm:px-5">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Save settings
        </Button>
      </div>
    </form>
  );
}
