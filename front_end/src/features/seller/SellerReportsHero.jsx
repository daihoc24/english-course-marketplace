import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import MetricCard from "../../shared/components/cards/MetricCard";

export function SellerReportsHero({ loading, onRefresh }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
            <FiAlertCircle /> Chất lượng khóa học
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Khiếu nại liên quan đến khóa học của tôi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Theo dõi phản ánh của học viên, yêu cầu từ admin và gửi phản hồi sau khi bạn đã kiểm tra hoặc khắc phục.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>
    </section>
  );
}

export function SellerReportStats({ stats }) {
  return (
    <section className="mt-5 grid gap-4 md:grid-cols-3">
      <MetricCard label="Tổng khiếu nại" value={stats.total} tone="blue" />
      <MetricCard label="Cần khắc phục (trang này)" value={stats.required} tone="orange" />
      <MetricCard label="Đã phản hồi/xử lý (trang này)" value={stats.fixed} tone="emerald" />
    </section>
  );
}
