"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/admin-ui/button";
import { Field, Input } from "@/components/admin-ui/field";
import { signIn, type LoginState } from "./auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: null, email: "" });
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error ? (
        <p role="alert" className="rounded-md border border-[#d92d20]/25 bg-[#d92d20]/[0.05] px-3 py-2 text-[0.8125rem] text-[#b42318]">
          {state.error}
        </p>
      ) : null}
      <Field id="email" label="Email">
        <Input name="email" type="email" required autoComplete="username" defaultValue={state.email} autoFocus className="h-9" />
      </Field>
      <Field id="password" label="Password">
        <div className="relative">
          <Input name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="h-9 pr-9" />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
          >
            {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </Field>
      <Button type="submit" variant="primary" size="lg" disabled={pending} className="mt-1 w-full">
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
