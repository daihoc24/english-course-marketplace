import { Menu } from "lucide-react";
import AdminSidebar from "../../../component/AdminSidebar";
import { useAdminShell } from "../../../context/AdminShellContext";

export function AdminPageShell({ children, contentClassName = "mx-auto max-w-7xl", mainClassName = "" }) {
  const { sidebarOpen } = useAdminShell();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AdminSidebar sidebarOpen={sidebarOpen} />

      <main className={`${sidebarOpen ? "ml-64" : "ml-0"} min-h-screen p-6 transition-all duration-300 ${mainClassName}`}>
        <div className={contentClassName}>{children}</div>
      </main>
    </div>
  );
}

export function AdminPageHeader({ actions, description, eyebrow, title }) {
  const { sidebarOpen, setSidebarOpen } = useAdminShell();

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
            aria-label={sidebarOpen ? "Thu gọn menu quản trị" : "Mở menu quản trị"}
          >
            <Menu size={20} />
          </button>
          <div>
            {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p>}
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
