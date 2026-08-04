import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiStar, FiX } from "react-icons/fi";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import { formatVND } from "../../utils/formatVND";
import { normalizeCertificateUrl } from "../../utils/certificates";
import { courseReviewStatusLabel, courseReviewStatusTone } from "./courseReviewView";

const ReviewStatus = ({ status }) => (
  <StatusBadge tone={courseReviewStatusTone[status] || "slate"}>
    {courseReviewStatusLabel[status] || status}
  </StatusBadge>
);

const CourseSummary = ({ request }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
      <img
        src={request.course.thumbnail}
        alt={request.course.title}
        className="h-56 w-full object-cover md:h-full"
      />
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ReviewStatus status={request.status} />
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {request.requestId}
          </span>
        </div>
        <h3 className="text-2xl font-bold leading-tight text-slate-950">
          {request.course.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {request.course.description || "Chưa có mô tả"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="rounded-xl bg-blue-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Giá</p>
            <p className="mt-1 font-bold text-blue-700">{formatVND(request.course.price)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Thời lượng</p>
            <p className="mt-1 font-semibold text-slate-900">{request.course.duration}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Số bài</p>
            <p className="mt-1 font-semibold text-slate-900">{request.course.lessons} bài</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cấp độ</p>
            <p className="mt-1 font-semibold text-slate-900">{request.course.level}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Danh mục</p>
            <p className="mt-1 font-semibold text-slate-900">{request.course.category}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SellerSummary = ({ request, formatDate }) => (
  <aside className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="font-semibold text-slate-950">Thông tin giảng viên</h4>
      <div className="mt-4 flex items-center gap-3">
        <img
          src={request.seller.avatar}
          alt={request.seller.name}
          className="h-14 w-14 rounded-full object-cover ring-4 ring-white"
        />
        <div>
          <h5 className="font-semibold text-slate-950">{request.seller.name}</h5>
          <p className="text-sm text-slate-500">
            {request.seller.email || "Chưa cập nhật email"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
          <span className="text-slate-500">Đánh giá</span>
          <div className="flex items-center gap-1">
            <FiStar className="fill-current text-yellow-400" />
            <span className="font-semibold text-slate-900">
              {request.seller.rating != null ? `${request.seller.rating}/5` : "Chưa có đánh giá"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
          <span className="text-slate-500">Tổng khóa học</span>
          <span className="font-semibold text-slate-900">
            {request.seller.totalCourses ?? "Chưa có dữ liệu"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
          <span className="text-slate-500">Tổng học viên</span>
          <span className="font-semibold text-slate-900">
            {request.seller.totalStudents ?? "Chưa có dữ liệu"}
          </span>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h4 className="font-semibold text-slate-950">Thông tin yêu cầu</h4>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Mã yêu cầu</span>
          <span className="font-semibold text-slate-900">{request.requestId}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Ngày gửi</span>
          <span className="text-right font-medium text-slate-900">
            {formatDate(request.submittedAt)}
          </span>
        </div>
      </div>
    </div>

    {request.type === "update" && request.changes && (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h4 className="font-semibold text-slate-950">Các thay đổi</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {request.changes.map((change, index) => (
            <li key={index} className="rounded-xl bg-slate-50 px-3 py-2">
              {change}
            </li>
          ))}
        </ul>
      </div>
    )}
  </aside>
);

const LessonReviewPanel = ({
  request,
  selectedLesson,
  selectedLessonIndex,
  selectedLessonResources,
  onLessonIndexChange,
}) => (
  <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-bold text-slate-950">Bài giảng video</h3>
        <p className="mt-1 text-sm text-slate-500">
          Kiểm tra video và tài liệu trước khi phê duyệt khóa học.
        </p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
        {request.lessonVideos.length} bài
      </span>
    </div>

    {request.lessonVideos.length === 0 ? (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-100">
        Chưa có bài giảng để kiểm tra.
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="review-lesson-select">
            Bài cần kiểm tra
          </label>
          <select
            id="review-lesson-select"
            value={selectedLessonIndex}
            onChange={(event) => onLessonIndexChange(Number(event.target.value))}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
          >
            {request.lessonVideos.map((lesson, index) => (
              <option key={lesson.id} value={index}>
                Bài {lesson.episodeNumber}: {lesson.name} - {lesson.duration ?? "Chưa rõ"} phút
              </option>
            ))}
          </select>

          {selectedLesson && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đang xem</p>
              <p className="mt-1 font-semibold leading-5 text-slate-950">
                Bài {selectedLesson.episodeNumber}: {selectedLesson.name}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  selectedLesson.isPreview
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {selectedLesson.isPreview ? "Có xem thử" : "Chỉ học viên đã mua"}
              </span>
            </div>
          )}
        </aside>

        {selectedLesson && (
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
              <video
                key={selectedLesson.id}
                className="aspect-video w-full bg-black object-contain"
                controls
                preload="metadata"
                src={selectedLesson.videoUrl}
              >
                Trình duyệt không hỗ trợ phát video.
              </video>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-950">Tài liệu bài học</h4>
                  <p className="text-sm text-slate-500">
                    Tài nguyên seller đính kèm cho bài này.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  {selectedLessonResources.length} tài liệu
                </span>
              </div>

              {selectedLessonResources.length ? (
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {selectedLessonResources.map((resource, index) => {
                    const resourceUrl = normalizeCertificateUrl(resource.url);

                    return (
                      <li
                        key={resource.id || `${resource.title}-${index}`}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {resource.title || "Tài liệu bài học"}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {resourceUrl ? "LINK" : "LINK KHÔNG HỢP LỆ"}
                          </p>
                        </div>
                        {resourceUrl ? (
                          <a
                            href={resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Mở
                          </a>
                        ) : (
                          <span className="shrink-0 text-xs text-slate-400">Không có link</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  Bài này chưa có tài liệu đính kèm.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </section>
);

const ModalActions = ({
  modalType,
  request,
  rejectionReason,
  actionLoading,
  onClose,
  onApprove,
  onReject,
  onModalTypeChange,
  onRejectionReasonChange,
}) => {
  if (modalType === "approve") {
    return (
      <div className="border-t border-slate-200 pt-5">
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="font-semibold text-emerald-800">Xác nhận phê duyệt</h4>
          <p className="mt-2 text-sm leading-6 text-emerald-700">
            Bạn có chắc chắn muốn phê duyệt yêu cầu này? Khóa học sẽ được công khai và có thể bán trên nền tảng.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onModalTypeChange("view")}
            disabled={actionLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => onApprove(request.id)}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck size={16} />
            {actionLoading ? "Đang phê duyệt..." : "Xác nhận phê duyệt"}
          </button>
        </div>
      </div>
    );
  }

  if (modalType === "reject") {
    return (
      <div className="border-t border-slate-200 pt-5">
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <h4 className="font-semibold text-rose-800">Từ chối yêu cầu</h4>
          <p className="mb-3 mt-2 text-sm leading-6 text-rose-700">
            Vui lòng cung cấp lý do từ chối để giảng viên có thể cải thiện khóa học.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(event) => onRejectionReasonChange(event.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows="4"
            className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onModalTypeChange("view");
              onRejectionReasonChange("");
            }}
            disabled={actionLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => onReject(request.id)}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!rejectionReason.trim() || actionLoading}
          >
            <FiX size={16} />
            {actionLoading ? "Đang từ chối..." : "Xác nhận từ chối"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Đóng
      </button>
      {request.status === "pending" && (
        <>
          <button
            type="button"
            onClick={() => onModalTypeChange("reject")}
            className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
          >
            <FiX size={16} />
            Từ chối
          </button>
          <button
            type="button"
            onClick={() => onModalTypeChange("approve")}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <FiCheck size={16} />
            Phê duyệt
          </button>
        </>
      )}
    </div>
  );
};

const modalTitle = {
  view: "Chi tiết yêu cầu",
  approve: "Phê duyệt yêu cầu",
  reject: "Từ chối yêu cầu",
};

const AdminCourseReviewModal = ({
  open,
  request,
  modalType,
  rejectionReason,
  selectedLessonIndex,
  actionLoading,
  formatDate,
  onClose,
  onApprove,
  onReject,
  onModalTypeChange,
  onRejectionReasonChange,
  onLessonIndexChange,
}) => {
  const selectedLesson = request?.lessonVideos?.[selectedLessonIndex];
  const selectedLessonResources = selectedLesson?.resources || [];

  return (
    <AnimatePresence>
      {open && request && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/30"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Kiểm duyệt khóa học
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {modalTitle[modalType] || modalTitle.view}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5">
              <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <CourseSummary request={request} />
                <SellerSummary request={request} formatDate={formatDate} />
              </div>

              <LessonReviewPanel
                request={request}
                selectedLesson={selectedLesson}
                selectedLessonIndex={selectedLessonIndex}
                selectedLessonResources={selectedLessonResources}
                onLessonIndexChange={onLessonIndexChange}
              />

              <ModalActions
                modalType={modalType}
                request={request}
                rejectionReason={rejectionReason}
                actionLoading={actionLoading}
                onClose={onClose}
                onApprove={onApprove}
                onReject={onReject}
                onModalTypeChange={onModalTypeChange}
                onRejectionReasonChange={onRejectionReasonChange}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(AdminCourseReviewModal);
