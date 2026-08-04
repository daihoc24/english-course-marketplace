import { Link, useLocation } from "react-router-dom";
import { sellerAccountLinks, sellerTabGroups } from "./sellerDashboardNavigation";

export default function SellerDashboardLayout({ activeTab, children, onTabChange }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <aside
        style={{
          top: "var(--app-header-height, 72px)",
          height: "calc(100vh - var(--app-header-height, 72px))",
        }}
        className="sticky w-72 shrink-0 border-r border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Khu vực người bán</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Bảng giảng viên</h2>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            Quản lý khóa học, doanh thu và các yêu cầu sau bán.
          </p>
        </div>

        <nav className="space-y-5 p-3">
          {sellerTabGroups.map((group) => (
            <div key={group.title}>
              <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="mr-3 text-base">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Tài khoản
            </p>
            <div className="space-y-1">
              {sellerAccountLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="mr-3 text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
