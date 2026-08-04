import { FiBell, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

export default function NotificationHero({ onMarkAllRead, onRefresh }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <FiBell /> Trung tâm thông báo
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Thông báo của tôi</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Xem nhanh các cập nhật từ hệ thống, khiếu nại, hoàn tiền và đơn hàng trong một trang gọn gàng.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700"
            >
              <FiCheckCircle /> Đánh dấu đã đọc
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800"
            >
              <FiRefreshCw /> Làm mới
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
