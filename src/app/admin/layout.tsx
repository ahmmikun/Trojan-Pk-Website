import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin-ui/toast";
import { AdminTheme } from "@/features/admin/shell/admin-theme";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Trojans PK Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-scope flex min-h-dvh flex-1 flex-col bg-[var(--canvas)] text-foreground antialiased">
      <AdminTheme />
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
