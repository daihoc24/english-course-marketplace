import React from "react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiVideo,
} from "react-icons/fi";
import {
  categoryLabels,
  formatDate,
  isVideoUrl,
  priorityClassName,
  priorityLabels,
  statusClassName,
  statusLabels,
} from "./myReportsView";

const hasAdminResponse = (report) =>
  Boolean(report.adminResponse || report.refundRecommendationReason);

const MyReportCard = ({
  index,
  isFocused = false,
  onViewCourse,
  page,
  pageSize,
  report,
}) => {
  const finalResponse = report.refundRecommendationReason || report.adminResponse;
  const video = isVideoUrl(report.attachmentUrl);

  return (
    <article
      id={`my-report-${report.id}`}
      className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isFocused ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
              {(page - 1) * pageSize + index + 1}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClassName(report.status)}`}>
              {statusLabels[report.status] || report.status}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityClassName(report.priority)}`}>
              Ưu tiên {priorityLabels[report.priority] || report.priority}
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              {categoryLabels[report.category] || categoryLabels.OTHER}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-950">{report.subject}</h2>
          <button
            type="button"
            onClick={() => report.courseId && onViewCourse(report.courseId)}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            <FiBookOpen /> {report.courseName}
          </button>

          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {report.detail}
          </p>

          {report.attachmentUrl && (
            <a
              href={report.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              {video ? (
                <FiVideo className="m-4 text-xl text-blue-600" />
              ) : (
                <img
                  src={report.attachmentUrl}
                  alt="Ảnh đính kèm khiếu nại"
                  className="h-16 w-16 rounded-xl object-cover"
                />
              )}
              <span className="inline-flex items-center gap-2">
                {video ? <FiVideo /> : <FiImage />} Xem {video ? "video" : "ảnh"} đính kèm
              </span>
            </a>
          )}

          {hasAdminResponse(report) ? (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <FiCheckCircle />
                {report.status === "REFUND_RECOMMENDED"
                  ? "Đề xuất hoàn tiền từ quản trị viên"
                  : "Phản hồi từ quản trị viên"}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">
                {finalResponse}
              </p>
              <p className="mt-2 text-xs text-emerald-700">
                {formatDate(report.refundRecommendedAt || report.resolvedAt)}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              <span className="font-bold">Admin đang xử lý khiếu nại này.</span> Bạn sẽ nhận được thông báo ngay khi có phản hồi chính thức.
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-56">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <FiClock /> Ngày gửi
            </div>
            <p className="mt-2">{formatDate(report.date)}</p>
          </div>
          {report.courseId && (
            <button
              type="button"
              onClick={() => onViewCourse(report.courseId)}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            >
              Xem khóa học
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default React.memo(MyReportCard);
