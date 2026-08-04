import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, CreditCard, RefreshCw } from "lucide-react";
import axiosClient from "../../API/axiosClient";
import AdminPagination from "../../component/AdminPagination";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import DataTable from "../../shared/components/table/DataTable";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { formatDateOnly, formatVnd } from "../../shared/utils/formatters";
import {
  normalizeOrderStatus,
  orderStatusLabel,
  orderStatusOptions,
  orderStatusTone,
} from "../../features/orders/orderView";

const orderColumns = [
  "STT",
  "Mã đơn",
  "Học viên",
  "Khóa học",
  "Ngày mua",
  "Số tiền",
  "Trạng thái",
];

const orderColWidths = ["70px", "120px", "240px", "360px", "170px", "170px", "150px"];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/order/all", {
        params: {
          page: currentPage - 1,
          size: pageSize,
          keyword: debouncedSearchTerm.trim() || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      const page = normalizePagePayload(response.data);
      setOrders(page.content);
      setTotalOrders(page.totalElements);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được danh sách đơn hàng.");
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, pageSize, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const pageCount = Math.max(1, Math.ceil(totalOrders / pageSize));
  const rowStartIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, pageSize]);

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  const summary = useMemo(() => {
    const paidOrders = orders.filter((order) => normalizeOrderStatus(order.status) === "PAID");
    return {
      total: totalOrders,
      paid: paidOrders.length,
      refunded: orders.filter((order) => normalizeOrderStatus(order.status) === "REFUNDED").length,
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.pricePaid || 0), 0),
    };
  }, [orders, totalOrders]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Thanh toán"
        title="Đơn hàng"
        description="Theo dõi đơn mua khóa học, trạng thái thanh toán và doanh thu đã ghi nhận."
        actions={(
          <ActionButton
            type="button"
            onClick={loadOrders}
            tone="slate"
            className="rounded-xl px-4 text-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Làm mới
          </ActionButton>
        )}
      />

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard label="Tổng đơn" value={summary.total.toLocaleString("vi-VN")} tone="blue" />
            <MetricCard label="Đã thanh toán (trang này)" value={summary.paid.toLocaleString("vi-VN")} tone="emerald" />
            <MetricCard label="Đã hoàn tiền (trang này)" value={summary.refunded.toLocaleString("vi-VN")} tone="slate" />
            <MetricCard label="Doanh thu trang này" value={formatVnd(summary.revenue)} tone="blue" />
          </div>

          <div className="mb-6">
            <TableToolbar
              filterOptions={orderStatusOptions}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo khóa học, học viên, email hoặc mã đơn..."
              searchValue={searchTerm}
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={orderColumns}
              colWidths={orderColWidths}
              emptyMessage={error || "Chưa có đơn hàng phù hợp."}
              loading={loading}
              loadingMessage="Đang tải đơn hàng..."
              minWidth={1280}
            >
              {!error && orders.map((order, index) => {
                const status = normalizeOrderStatus(order.status);

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-semibold text-slate-700">
                      {(rowStartIndex + index + 1).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-4 font-mono text-slate-700">#{String(order.id).padStart(6, "0")}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-950">{order.userName || "Chưa cập nhật"}</div>
                      <div className="text-xs text-slate-500">{order.userEmail || "Chưa cập nhật email"}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {order.courseImage ? (
                          <img src={order.courseImage} alt="" className="h-12 w-16 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100">
                            <BookOpen className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-950">{order.courseName || order.idCourse?.name || "Chưa cập nhật"}</div>
                          <div className="text-xs text-slate-500">ID khóa học: {order.courseId || order.idCourse?.id || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDateOnly(order.dateOrder, "Chưa cập nhật")}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-blue-700">
                      <span className="inline-flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        {formatVnd(order.pricePaid)}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge tone={orderStatusTone[status] || "slate"}>
                        {orderStatusLabel[status] || order.status || "Chưa cập nhật"}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
            {!loading && !error && orders.length > 0 && (
              <AdminPagination
                currentPage={currentPage}
                itemLabel="đơn hàng"
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSize={pageSize}
                totalItems={totalOrders}
              />
            )}
          </section>
    </AdminPageShell>
  );
}
