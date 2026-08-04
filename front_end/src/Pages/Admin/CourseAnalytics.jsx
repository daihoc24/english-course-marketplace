import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { MdSchool, MdTrendingUp } from "react-icons/md";
import axiosClient from "../../API/axiosClient";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import Panel from "../../shared/components/cards/Panel";
import StateBlock from "../../shared/components/feedback/StateBlock";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import DataTable from "../../shared/components/table/DataTable";
import { formatCompactNumber, formatVnd } from "../../shared/utils/formatters";

const recentOrderColumns = ["Học viên", "Khóa học", "Số tiền"];
const recentOrderColWidths = ["220px", "360px", "170px"];
const chartColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function CourseAnalytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/admin/overview");
      setOverview(response.data?.result ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được dữ liệu phân tích.");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const rawMonthlySales = overview?.monthlySales;
  const rawTopCourses = overview?.topCourses;
  const rawRecentOrders = overview?.recentOrders;
  const monthlySales = useMemo(() => rawMonthlySales ?? [], [rawMonthlySales]);
  const topCourses = useMemo(() => rawTopCourses ?? [], [rawTopCourses]);
  const recentOrders = useMemo(() => rawRecentOrders ?? [], [rawRecentOrders]);

  const recentOrderCount = recentOrders.length;
  const totalPaidOrders = monthlySales.reduce((sum, item) => sum + Number(item.sales || 0), 0);
  const averageOrderValue = totalPaidOrders ? Number(overview?.paidRevenue || 0) / totalPaidOrders : 0;

  const topCourseChartData = useMemo(
    () =>
      topCourses.map((course, index) => ({
        ...course,
        color: chartColors[index % chartColors.length],
      })),
    [topCourses]
  );

  const exportData = () => {
    const header = ["Mã đơn", "Học viên", "Khóa học", "Cấp độ", "Bài học", "Thời lượng", "Số tiền", "Trạng thái"];
    const rows = recentOrders.map((order) => [
      order.id,
      order.learnerName || "",
      order.courseName || "",
      order.level || "",
      order.lessons ?? 0,
      order.totalHours ?? "",
      order.pricePaid ?? 0,
      order.status || "",
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `course_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Báo cáo"
        title="Phân tích khóa học"
        description="Số liệu lấy từ đơn hàng đã thanh toán và các khóa học đang công khai."
        actions={(
          <>
            <ActionButton
              type="button"
              onClick={loadOverview}
              tone="slate"
              className="rounded-xl px-4 text-sm"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Làm mới
            </ActionButton>
            <ActionButton
              type="button"
              onClick={exportData}
              disabled={recentOrders.length === 0}
              className="rounded-xl px-4 text-sm"
            >
              <FiDownload />
              Xuất CSV
            </ActionButton>
          </>
        )}
      />

          {loading && <StateBlock text="Đang tải dữ liệu phân tích..." />}
          {!loading && error && <StateBlock text={error} />}

          {!loading && !error && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <MetricCard label="Doanh thu đã thanh toán" value={formatVnd(overview?.paidRevenue)} icon={<MdTrendingUp />} />
                <MetricCard label="Khóa học công khai" value={(overview?.publishedCourses ?? 0).toLocaleString("vi-VN")} icon={<MdSchool />} tone="emerald" />
                <MetricCard label="Đơn gần đây" value={recentOrderCount.toLocaleString("vi-VN")} icon={<MdTrendingUp />} tone="amber" />
                <MetricCard label="Giá trị đơn trung bình" value={formatVnd(averageOrderValue)} icon={<MdTrendingUp />} tone="violet" />
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Panel title="Doanh thu theo tháng">
                  {monthlySales.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlySales} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis tickFormatter={formatCompactNumber} stroke="#64748b" />
                        <Tooltip formatter={(value) => [formatVnd(value), "Doanh thu"]} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Doanh thu"
                          stroke="#059669"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <StateBlock text="Chưa có dữ liệu doanh thu." compact />
                  )}
                </Panel>
                <Panel title="Số đơn theo tháng">
                  {monthlySales.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySales} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis allowDecimals={false} stroke="#64748b" />
                        <Tooltip formatter={(value) => [Number(value || 0).toLocaleString("vi-VN"), "Số đơn"]} />
                        <Bar dataKey="sales" name="Số đơn" fill="#2563eb" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <StateBlock text="Chưa có dữ liệu đơn hàng." compact />
                  )}
                </Panel>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Panel title="Top khóa học theo lượt mua">
                  {topCourseChartData.length ? (
                    <div className="grid h-full gap-4 md:grid-cols-[1fr_220px] md:items-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={topCourseChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                          >
                            {topCourseChartData.map((course) => (
                              <Cell key={course.name} fill={course.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${Number(value || 0).toLocaleString("vi-VN")} lượt mua`, "Lượt mua"]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-3">
                        {topCourseChartData.map((course) => (
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
                    <StateBlock text="Chưa có khóa học phát sinh đơn." compact />
                  )}
                </Panel>
                <Panel title="Đơn hàng gần đây" bodyClassName="h-80 overflow-auto">
                  {recentOrders.length ? (
                    <DataTable
                      columns={recentOrderColumns}
                      colWidths={recentOrderColWidths}
                      minWidth={750}
                    >
                      {recentOrders.slice(0, 8).map((order) => (
                        <tr key={order.id}>
                          <td className="p-3 font-semibold text-slate-900">{order.learnerName || "Chưa cập nhật"}</td>
                          <td className="p-3 text-slate-600">{order.courseName || "Chưa cập nhật"}</td>
                          <td className="p-3 font-semibold text-blue-700">{formatVnd(order.pricePaid)}</td>
                        </tr>
                      ))}
                    </DataTable>
                  ) : (
                    <StateBlock text="Chưa có đơn hàng đã thanh toán." compact />
                  )}
                </Panel>
              </div>
            </>
          )}
    </AdminPageShell>
  );
}
