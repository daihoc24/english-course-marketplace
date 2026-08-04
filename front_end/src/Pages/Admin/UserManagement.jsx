import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Unlock,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import AdminPagination from "../../component/AdminPagination";
import axiosClient from "../../API/axiosClient";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import InfoBadge from "../../shared/components/badges/InfoBadge";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import DataTable from "../../shared/components/table/DataTable";
import TableToolbar from "../../shared/components/table/TableToolbar";
import {
  getInitials,
  roleLabel,
  roleTone,
  toAdminUser,
  userRoleOptions,
  userStatusLabel,
  userStatusOptions,
  userStatusTone,
} from "../../features/users/userView";

const userColumns = [
  "STT",
  "Người dùng",
  "Liên hệ",
  "Vai trò",
  "Trạng thái",
  { label: "Thao tác", className: "p-4 text-right" },
];

const userColWidths = ["70px", "300px", "300px", "150px", "170px", "150px"];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/users/all", {
        params: {
          page: currentPage - 1,
          size: pageSize,
          keyword: debouncedSearchTerm.trim() || undefined,
          role: roleFilter === "ALL" ? undefined : roleFilter,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        },
      });
      const page = normalizePagePayload(response.data);
      setUsers(page.content.map(toAdminUser));
      setTotalUsers(page.totalElements);
    } catch (err) {
      console.error("Không thể tải danh sách người dùng:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách người dùng. Vui lòng thử lại.");
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateUser = async (user, changes) => {
    const nextUser = { ...user, ...changes };
    setUpdatingId(user.id);
    setError("");
    try {
      const response = await axiosClient.put(`/users/updateStatus/${user.id}`, {
      active: nextUser.active,
      });
      const updated = toAdminUser(response.data?.result ?? response.data ?? nextUser);
      setUsers((items) => items.map((item) => (item.id === user.id ? updated : item)));
    } catch (err) {
      console.error("Không thể cập nhật người dùng:", err);
      setError(err?.response?.data?.message || "Không thể cập nhật tài khoản. Vui lòng thử lại.");
    } finally {
      setUpdatingId(null);
    }
  };

  const rowStartIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, roleFilter, statusFilter, pageSize]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(totalUsers / pageSize));
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageSize, totalUsers]);

  const summary = useMemo(() => {
    const activeUsers = users.filter((user) => user.active);
    return {
      total: totalUsers,
      active: activeUsers.length,
      inactive: users.length - activeUsers.length,
      sellers: users.filter((user) => user.role === "SELLER").length,
      admins: users.filter((user) => user.role === "ADMIN").length,
    };
  }, [totalUsers, users]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Quản trị tài khoản"
        title="Người dùng"
        description="Xem tài khoản và khóa/mở tài khoản khi cần."
        actions={(
          <ActionButton
            type="button"
            onClick={loadUsers}
            tone="slate"
            className="rounded-xl px-4 text-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Làm mới
          </ActionButton>
        )}
      />

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard icon={<Users />} label="Tổng tài khoản" value={summary.total.toLocaleString("vi-VN")} />
            <MetricCard icon={<UserCheck />} label="Đang hoạt động (trang này)" value={summary.active.toLocaleString("vi-VN")} tone="emerald" />
            <MetricCard icon={<UserX />} label="Đã khóa (trang này)" value={summary.inactive.toLocaleString("vi-VN")} tone="rose" />
            <MetricCard icon={<BadgeCheck />} label="Giảng viên (trang này)" value={summary.sellers.toLocaleString("vi-VN")} tone="blue" />
            <MetricCard icon={<ShieldCheck />} label="Admin (trang này)" value={summary.admins.toLocaleString("vi-VN")} tone="violet" />
          </div>

          <div className="mb-6">
            <TableToolbar
              filters={[
                {
                  key: "role",
                  options: userRoleOptions,
                  value: roleFilter,
                  onChange: setRoleFilter,
                  className: "lg:w-48",
                },
                {
                  key: "status",
                  options: userStatusOptions,
                  value: statusFilter,
                  onChange: setStatusFilter,
                  className: "lg:w-48",
                },
              ]}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm tên, email, username hoặc số điện thoại..."
              searchValue={searchTerm}
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold">Danh sách tài khoản</h2>
              <p className="mt-1 text-sm text-slate-500">
                Đang hiển thị {users.length.toLocaleString("vi-VN")} / {totalUsers.toLocaleString("vi-VN")} tài khoản.
              </p>
            </div>

            <DataTable
              columns={userColumns}
              colWidths={userColWidths}
              emptyMessage="Không có tài khoản phù hợp."
              loading={loading}
              loadingMessage="Đang tải danh sách người dùng..."
              minWidth={1140}
            >
              {users.map((user, index) => {
                const isUpdating = updatingId === user.id;
                const status = user.active ? "ACTIVE" : "LOCKED";

                return (
                  <tr key={user.id} className="align-top transition hover:bg-slate-50/80">
                    <td className="p-4 font-semibold text-slate-700">
                      {(rowStartIndex + index + 1).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                            {getInitials(user.fullname)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-950">{user.fullname}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            @{user.username || "chua-cap-nhat"} · ID {user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-slate-400" />
                        {user.email || "Chưa cập nhật email"}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Phone size={15} className="text-slate-400" />
                        {user.phone || "Chưa cập nhật số điện thoại"}
                      </div>
                    </td>
                    <td className="p-4">
                      <InfoBadge shape="pill" size="sm" tone={roleTone[user.role] || "slate"}>
                        {roleLabel(user.role)}
                      </InfoBadge>
                    </td>
                    <td className="p-4">
                      <StatusBadge tone={userStatusTone[status]}>
                        {userStatusLabel[status]}
                      </StatusBadge>
                    </td>
                    <td className="p-4 text-right">
                      <ActionButton
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateUser(user, { active: !user.active })}
                        tone={user.active ? "rose" : "emerald"}
                      >
                        {user.active ? <Lock size={14} /> : <Unlock size={14} />}
                        {isUpdating ? "Đang lưu..." : user.active ? "Khóa" : "Mở khóa"}
                      </ActionButton>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
            <AdminPagination
              currentPage={currentPage}
              itemLabel="tài khoản"
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              totalItems={totalUsers}
            />
          </section>
    </AdminPageShell>
  );
}
