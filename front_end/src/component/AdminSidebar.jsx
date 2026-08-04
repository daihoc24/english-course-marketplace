import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSettings } from "react-icons/fi";
import {
  MdDashboard,
  MdAnalytics,
  MdPeople,
  MdReport,
  MdStorefront,
  MdPaid,
  MdAccountBalanceWallet,
  MdShoppingCart,
} from "react-icons/md";
import { LayoutDashboard } from "lucide-react";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const inactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-950";
const active = "bg-blue-50 text-blue-700 ring-1 ring-blue-100";

function navClassName(isActive) {
  return `${linkBase} ${isActive ? active : inactive}`;
}

const navItems = [
  { to: "/admin/dashboard", label: "Tổng quan", icon: MdDashboard, isActive: (pathname) => pathname === "/admin/dashboard" },
  { to: "/admin/course-approval", label: "Duyệt khóa học", icon: MdStorefront },
  { to: "/admin/orders", label: "Đơn hàng", icon: MdShoppingCart },
  { to: "/admin/refunds", label: "Hoàn tiền", icon: MdPaid },
  { to: "/admin/withdrawals", label: "Chi trả", icon: MdAccountBalanceWallet },
  { to: "/admin/ComplaintManagement", label: "Khiếu nại", icon: MdReport },
  { to: "/admin/UserManagement", label: "Người dùng", icon: MdPeople },
  { to: "/admin/CourseAnalytics", label: "Phân tích", icon: MdAnalytics },
];

const navGroups = [
  { title: "Điều hành", routes: ["/admin/dashboard", "/admin/CourseAnalytics"] },
  { title: "Giao dịch", routes: ["/admin/orders", "/admin/refunds", "/admin/withdrawals"] },
  { title: "Nội dung", routes: ["/admin/course-approval", "/admin/ComplaintManagement"] },
  { title: "Quản trị", routes: ["/admin/UserManagement"] },
].map((group) => ({
  ...group,
  items: group.routes.map((route) => navItems.find((item) => item.to === route)).filter(Boolean),
}));

export default function AdminSidebar({ sidebarOpen }) {
  const { pathname } = useLocation();

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? "auto" : "0" }}
      style={{ top: "var(--app-header-height, 104px)" }}
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } fixed bottom-0 left-0 z-30 flex flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm transition-[top,width] duration-300 ease-out`}
    >
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-8 flex shrink-0 items-center gap-3 px-0.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <LayoutDashboard className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
              Quản trị
            </div>
            <div className="truncate text-lg font-bold text-slate-950">
              Admin<span className="text-blue-600">Panel</span>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto">
          <ul className="space-y-5">
            {navGroups.map((group) => (
              <li key={group.title}>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {group.title}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) => navClassName(item.isActive ? item.isActive(pathname) : isActive)}
                        >
                          <Icon className="shrink-0 text-lg" />
                          {item.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            <li className="mt-2 border-t border-slate-200 pt-4">
              <span
                className={`${linkBase} cursor-not-allowed text-slate-400 opacity-70`}
                title="Sắp có"
              >
                <FiSettings className="shrink-0 text-lg" />
                Cài đặt
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </motion.div>
  );
}
