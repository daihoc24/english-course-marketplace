import { FiMessageSquare } from "react-icons/fi";
import { SELLER_REPORT_PAGE_SIZE } from "./sellerReportsView";
import SellerReportCard from "./SellerReportCard";

export default function SellerReportsList({
  error,
  loading,
  onOpenReport,
  page,
  reports,
}) {
  if (loading) {
    return (
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Đang tải khiếu nại...
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-5 rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {error}
      </section>
    );
  }

  if (reports.length === 0) {
    return (
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FiMessageSquare className="text-2xl" />
        </div>
        <h2 className="text-xl font-bold">Chưa có khiếu nại phù hợp</h2>
        <p className="mt-2 text-sm text-slate-500">
          Khi học viên gửi khiếu nại về khóa học của bạn, nội dung sẽ xuất hiện ở đây.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-5 space-y-4">
      {reports.map((report, index) => (
        <SellerReportCard
          key={report.id}
          report={report}
          rowNumber={(page - 1) * SELLER_REPORT_PAGE_SIZE + index + 1}
          onOpen={onOpenReport}
        />
      ))}
    </section>
  );
}
