import { FiBookOpen, FiClock, FiImage, FiVideo } from "react-icons/fi";
import {
  formatSellerReportDate,
  isSellerReportVideoUrl,
  sellerReportCategoryLabels,
  sellerReportPriorityClassName,
  sellerReportPriorityLabels,
  sellerReportStatusClassName,
  sellerReportStatusLabels,
} from "./sellerReportsView";

export default function SellerReportCard({ onOpen, report, rowNumber }) {
  const needsAction = report.status === "SELLER_ACTION_REQUIRED";
  const hasVideoEvidence = isSellerReportVideoUrl(report.attachmentUrl);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              STT {rowNumber}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sellerReportStatusClassName(report.status)}`}>
              {sellerReportStatusLabels[report.status] || report.status}
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              {sellerReportCategoryLabels[report.category] || sellerReportCategoryLabels.OTHER}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sellerReportPriorityClassName(report.priority)}`}>
              {sellerReportPriorityLabels[report.priority] || sellerReportPriorityLabels.NORMAL}
            </span>
            {report.attachmentUrl && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                {hasVideoEvidence ? <FiVideo /> : <FiImage />} Có {hasVideoEvidence ? "video" : "ảnh"} minh họa
              </span>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold">{report.subject}</h2>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            <FiBookOpen /> {report.courseName}
          </p>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{report.detail}</p>

          {report.sellerActionRequest && (
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-bold text-orange-800">Yêu cầu từ admin</p>
              <p className="mt-2 text-sm leading-6 text-orange-900">{report.sellerActionRequest}</p>
              <p className="mt-2 text-xs text-orange-700">{formatSellerReportDate(report.sellerActionRequestedAt)}</p>
            </div>
          )}

          {report.sellerResponse && (
            <div
              className={`mt-4 rounded-2xl border p-4 ${
                needsAction ? "border-amber-100 bg-amber-50" : "border-emerald-100 bg-emerald-50"
              }`}
            >
              <p className={`text-sm font-bold ${needsAction ? "text-amber-800" : "text-emerald-800"}`}>
                {needsAction ? "Lần cập nhật trước đó của bạn" : "Cập nhật từ bạn"}
              </p>
              <p className={`mt-2 text-sm leading-6 ${needsAction ? "text-amber-900" : "text-emerald-900"}`}>
                {report.sellerResponse}
              </p>
              {needsAction && (
                <p className="mt-2 text-xs text-amber-700">
                  Admin đã yêu cầu xử lý thêm nên nội dung này chỉ là cập nhật trước đó.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-52">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <FiClock /> Ngày gửi
            </div>
            <p className="mt-2">{formatSellerReportDate(report.date)}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpen(report)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition ${
              needsAction
                ? "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
                : "bg-slate-100 text-slate-700 shadow-slate-200/50 hover:bg-slate-200"
            }`}
          >
            {needsAction ? "Xem và phản hồi" : "Xem chi tiết"}
          </button>
        </div>
      </div>
    </article>
  );
}
