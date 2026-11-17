"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Form field primitives. <Field> wires label, description and error to its control through
 * context, so every input gets correct `id`, `aria-describedby` and `aria-invalid` without
 * repeating it at each call site.
 */

type FieldCtx = { id: string; describedBy?: string; invalid: boolean };
const Ctx = createContext<FieldCtx | null>(null);

export function useField() {
  return useContext(Ctx);
}

export const controlClass =
  "block w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-[0.8125rem] text-foreground shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 aria-invalid:border-[#d92d20] aria-invalid:focus-visible:ring-[#d92d20]/15 read-only:bg-muted/50 read-only:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60";

type FieldProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  /** Right side of the label row, e.g. a character counter or a tab switch. */
  aside?: React.ReactNode;
  /** Use a fixed id (e.g. the form field name) so error summaries can link to it. */
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, description, error, required, aside, id: fixedId, className, children }: FieldProps) {
  const auto = useId();
  const id = fixedId ?? auto;
  const hintId = `${id}-hint`;
  return (
    <Ctx.Provider value={{ id, describedBy: error || description ? hintId : undefined, invalid: Boolean(error) }}>
      <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
        <div className="flex min-h-5 items-end justify-between gap-3">
          <label htmlFor={id} className="text-[0.8125rem] font-medium text-foreground">
            {label}
            {required ? <span className="ml-0.5 text-muted-foreground" aria-hidden="true">*</span> : null}
          </label>
          {aside}
        </div>
        {children}
        {error ? (
          <p id={hintId} className="text-xs text-[#b42318]">{error}</p>
        ) : description ? (
          <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </Ctx.Provider>
  );
}

function useControlProps(props: { id?: string; "aria-describedby"?: string; "aria-invalid"?: React.AriaAttributes["aria-invalid"] }) {
  const f = useField();
  return {
    id: props.id ?? f?.id,
    "aria-describedby": props["aria-describedby"] ?? f?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (f?.invalid ? true : undefined),
  };
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input {...props} {...useControlProps(props)} className={cn(controlClass, "h-8", className)} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea {...props} {...useControlProps(props)} className={cn(controlClass, "resize-y py-2 leading-relaxed", className)} />;
}

const chevron =
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6b73%22 stroke-width=%222%22 stroke-linecap=%22round%22><path d=%22m7 10 5 5 5-5%22/></svg>')] bg-[position:right_0.5rem_center] bg-no-repeat";

/** Native select: best keyboard, screen reader and mobile behaviour; styled to match. */
export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select {...props} {...useControlProps(props)} className={cn(controlClass, chevron, "h-8 appearance-none pr-8", className)}>
      {children}
    </select>
  );
}

/** Input with a live counter in the label row. Turns amber near the limit and red past it. */
export function useCounter(initial: string, max?: number) {
  const [length, setLength] = useState(initial.length);
  const counter = max ? (
    <span className={cn("text-[0.6875rem] tabular-nums", length > max ? "text-[#b42318]" : length > max * 0.9 ? "text-amber-600" : "text-muted-foreground/70")}>
      {length}/{max}
    </span>
  ) : null;
  return { counter, onLength: setLength };
}

type SwitchProps = {
  name: string;
  label: string;
  description?: React.ReactNode;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/** Labelled switch row. Submits "on" when checked, like a checkbox. */
export function SwitchRow({ name, label, description, defaultChecked, onCheckedChange }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[0.8125rem] font-medium">{label}</label>
        {description ? <p id={`${id}-d`} className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      <SwitchPrimitive.Root
        id={id}
        name={name}
        value="on"
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        aria-describedby={description ? `${id}-d` : undefined}
        className="relative mt-0.5 inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full bg-foreground/15 p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 data-checked:bg-success"
      >
        <SwitchPrimitive.Thumb className="block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 data-checked:translate-x-3.5" />
      </SwitchPrimitive.Root>
    </div>
  );
}
