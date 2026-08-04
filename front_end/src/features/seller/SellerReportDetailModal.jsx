import { FiImage, FiSend, FiVideo } from "react-icons/fi";
import {
  isSellerReportVideoUrl,
  sellerReportPriorityClassName,
  sellerReportPriorityLabels,
  sellerReportStatusClassName,
  sellerReportStatusLabels,
} from "./sellerReportsView";

export default function SellerReportDetailModal({
  canRespond = false,
  error = "",
  onClose,
  onRespond,
  onResponseChange,
  report,
  responseText = "",
  saving = false,
  successMessage = "",
}) {
  if (!report) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="text-2xl font-bold">Phản hồi khiếu nại</h2>
          <p className="mt-1 text-sm text-slate-500">{report.courseName}</p>
        </div>
        <div className="space-y-4 px-5 py-5 pb-7 sm:px-6">
          {successMessage && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Nội dung học viên gửi</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.detail}</p>
            {report.attachmentUrl && (
              <a
                href={report.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                {isSellerReportVideoUrl(report.attachmentUrl) ? (
                  <video src={report.attachmentUrl} controls preload="metadata" className="max-h-80 w-full bg-slate-950" />
                ) : (
                  <img src={report.attachmentUrl} alt="Ảnh minh họa khiếu nại" className="max-h-80 w-full bg-slate-100 object-contain" />
                )}
                <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700">
                  {isSellerReportVideoUrl(report.attachmentUrl) ? <FiVideo /> : <FiImage />}
                  Xem {isSellerReportVideoUrl(report.attachmentUrl) ? "video" : "ảnh"} minh họa học viên gửi
                </div>
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sellerReportPriorityClassName(report.priority)}`}>
              {sellerReportPriorityLabels[report.priority] || sellerReportPriorityLabels.NORMAL}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sellerReportStatusClassName(report.status)}`}>
              {sellerReportStatusLabels[report.status] || report.status}
            </span>
          </div>

          {report.sellerActionRequest && (
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-bold text-orange-800">Admin yêu cầu bạn xử lý</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-orange-900">{report.sellerActionRequest}</p>
            </div>
          )}

          {!canRespond && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              Admin đang xử lý khiếu nại này. Bạn có thể xem nội dung để nắm tình hình.
            </div>
          )}

          <label className={`block text-sm font-bold ${canRespond ? "text-slate-800" : "text-slate-400"}`}>
            Bạn đã kiểm tra/khắc phục như thế nào?
          </label>
          <textarea
            value={responseText}
            onChange={(event) => onResponseChange(event.target.value)}
            rows={6}
            placeholder={
              canRespond
                ? "Ví dụ: Đã upload lại video bài 2, kiểm tra quyền xem thử và cập nhật mô tả khóa học..."
                : "Admin đang xử lý. Bạn chưa cần viết phản hồi ở bước này."
            }
            disabled={!canRespond}
            className={`w-full resize-y rounded-2xl border px-4 py-3 text-sm outline-none ${
              canRespond
                ? "border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 placeholder:text-slate-400"
            }`}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={onRespond}
              disabled={saving || !responseText.trim() || !canRespond}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiSend /> {saving ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
