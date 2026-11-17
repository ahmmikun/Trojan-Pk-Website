"use client";

import { Toast } from "@base-ui/react/toast";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * App-wide toasts. `toast.success("Saved")` works from any client code, including after
 * a Server Action resolves. Rendered in an aria-live region by Base UI.
 */
export const toastManager = Toast.createToastManager();

export const toast = {
  success: (title: string, description?: string) => toastManager.add({ title, description, type: "success", timeout: 3500 }),
  error: (title: string, description?: string) => toastManager.add({ title, description, type: "error", timeout: 7000 }),
};

function Toasts() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => (
    <Toast.Root
      key={t.id}
      toast={t}
      className={cn(
        "admin-scope absolute right-0 bottom-0 w-full origin-bottom rounded-lg border border-border bg-background p-3 pr-9 text-foreground shadow-lg shadow-black/10 select-none",
        "[transform:translateY(calc(var(--toast-index)*-0.6rem))_scale(calc(1-var(--toast-index)*0.04))] [transition:transform_200ms,opacity_200ms] data-ending-style:opacity-0 data-starting-style:[transform:translateY(0.75rem)] data-starting-style:opacity-0",
        "data-expanded:[transform:translateY(calc(var(--toast-offset-y)*-1-var(--toast-index)*0.5rem))]",
      )}
    >
      <Toast.Content className="flex items-start gap-2.5">
        {t.type === "error" ? <CircleAlert className="mt-px size-4 shrink-0 text-[#d92d20]" aria-hidden="true" /> : <CheckCircle2 className="mt-px size-4 shrink-0 text-success" aria-hidden="true" />}
        <div className="min-w-0">
          <Toast.Title className="text-[0.8125rem] font-medium">{t.title}</Toast.Title>
          {t.description ? <Toast.Description className="mt-0.5 text-xs text-muted-foreground">{t.description}</Toast.Description> : null}
        </div>
      </Toast.Content>
      <Toast.Close className="absolute top-2.5 right-2.5 inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground" aria-label="Dismiss">
        <X className="size-3.5" aria-hidden="true" />
      </Toast.Close>
    </Toast.Root>
  ));
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-[60] w-[min(22rem,calc(100vw-2rem))]">
          <Toasts />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
