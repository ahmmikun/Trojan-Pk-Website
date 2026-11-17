import { requireAdmin } from "@/features/admin/auth";
import { AdminSidebar } from "@/features/admin/shell/sidebar";

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await requireAdmin();
  return (
    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
      <AdminSidebar email={user.email} />
      <main id="main" className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-[84rem] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
