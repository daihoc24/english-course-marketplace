import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axiosClient from "../../API/axiosClient";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import Panel from "../../shared/components/cards/Panel";
import StateBlock from "../../shared/components/feedback/StateBlock";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import DataTable from "../../shared/components/table/DataTable";
import { formatCompactNumber, formatVnd } from "../../shared/utils/formatters";

const chartColors = ["#2563eb", "#06b6d4", "#f59e0b", "#f97316", "#8b5cf6"];

const recentOrderColumns = ["Học viên", "Khóa học", "Cấp độ", "Thời lượng", "Số tiền", "Trạng thái"];
const recentOrderColWidths = ["220px", "320px", "160px", "160px", "170px", "140px"];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/admin/overview");
      setOverview(response.data?.result ?? null);
    } catch (err) {
      console.error("Không thể tải tổng quan admin:", err);
      setOverview(null);
      setError(err?.response?.data?.message || "Không thể tải dữ liệu tổng quan. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const monthlySales = overview?.monthlySales ?? [];
  const topCourses = useMemo(
    () =>
      (overview?.topCourses ?? []).map((course, index) => ({
        ...course,
        color: chartColors[index % chartColors.length],
      })),
    [overview]
  );
  const recentOrders = overview?.recentOrders ?? [];
  const paidOrders = monthlySales.reduce((sum, item) => sum + Number(item.sales || 0), 0);

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Admin workspace"
        title="Tổng quan"
        description="Theo dõi doanh thu, đơn hàng và các khu vực cần quản trị trong một màn hình gọn."
        actions={(
          <ActionButton
            type="button"
            onClick={loadOverview}
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

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<Users />} label="Tài khoản" value={loading ? "..." : (overview?.totalUsers ?? 0).toLocaleString("vi-VN")} />
            <MetricCard icon={<BookOpen />} label="Khóa học công khai" value={loading ? "..." : (overview?.publishedCourses ?? 0).toLocaleString("vi-VN")} tone="emerald" />
            <MetricCard icon={<DollarSign />} label="Doanh thu đã thanh toán" value={loading ? "..." : formatVnd(overview?.paidRevenue)} tone="violet" />
            <MetricCard icon={<ShoppingCart />} label="Đơn đã thanh toán" value={loading ? "..." : paidOrders.toLocaleString("vi-VN")} tone="amber" />
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Panel title="Doanh thu và số đơn theo tháng">
              {loading ? (
                <StateBlock text="Đang tải biểu đồ..." className="min-h-80" />
              ) : monthlySales.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis yAxisId="sales" stroke="#2563eb" allowDecimals={false} />
                    <YAxis
                      yAxisId="revenue"
                      orientation="right"
                      stroke="#059669"
                      tickFormatter={formatCompactNumber}
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "Doanh thu" ? [formatVnd(value), name] : [value, name]
                      }
                    />
                    <Bar yAxisId="sales" dataKey="sales" name="Số đơn" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="revenue" dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <StateBlock text="Chưa có dữ liệu doanh thu." className="min-h-80" />
              )}
            </Panel>

            <Panel title="Khóa học được mua nhiều">
              {loading ? (
                <StateBlock text="Đang tải dữ liệu..." className="min-h-80" />
              ) : topCourses.length ? (
                <div className="grid h-full gap-4 md:grid-cols-[1fr_180px] md:items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={topCourses} dataKey="value" nameKey="name" outerRadius={100}>
                        {topCourses.map((course) => (
                          <Cell key={course.name} fill={course.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {topCourses.map((course) => (
                      <div key={course.name} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: course.color }} />
                        <div>
                          <p className="font-semibold text-slate-800">{course.name}</p>
                          <p className="text-xs text-slate-500">{course.value} lượt mua</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <StateBlock text="Chưa có khóa học phát sinh đơn." className="min-h-80" />
              )}
            </Panel>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold">Đơn hàng gần đây</h2>
              <p className="mt-1 text-sm text-slate-500">Các đơn đã thanh toán mới nhất trong hệ thống.</p>
            </div>
            <DataTable
              columns={recentOrderColumns}
              colWidths={recentOrderColWidths}
              emptyMessage="Chưa có đơn hàng đã thanh toán."
              loading={loading}
              loadingMessage="Đang tải đơn hàng..."
              minWidth={1170}
            >
              {recentOrders.slice(0, 8).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-semibold text-slate-900">{order.learnerName || "Chưa cập nhật"}</td>
                  <td className="p-4 text-slate-700">{order.courseName || "Chưa cập nhật"}</td>
                  <td className="p-4 text-slate-600">{order.level || "Chưa cập nhật"}</td>
                  <td className="p-4 text-slate-600">
                    {order.totalHours != null ? `${order.totalHours} giờ` : "Chưa cập nhật"}
                  </td>
                  <td className="p-4 font-semibold text-blue-700">{formatVnd(order.pricePaid)}</td>
                  <td className="p-4">
                    <StatusBadge tone="emerald">{order.status || "PAID"}</StatusBadge>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
    </AdminPageShell>
  );
}
