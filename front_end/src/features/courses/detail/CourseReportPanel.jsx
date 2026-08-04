import React from "react";
import { AlertCircle, MessageSquare } from "lucide-react";
import ReusableReportForm from "../../../component/ReusableReportForm";

const CourseReportPanel = ({
  loggedIn,
  courseId,
  courseTitle,
  myReports,
  reportsLoading,
  onCreated,
  onLogin,
  onOpenReports,
}) => (
  <div className="py-8">
    <h2 className="mb-4 text-2xl font-bold">Gửi khiếu nại về khoá học</h2>
    {loggedIn ? (
      <ReusableReportForm
        courseId={courseId}
        courseTitle={courseTitle}
        onCreated={onCreated}
      />
    ) : (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-950">
                Bạn cần đăng nhập để gửi khiếu nại
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Admin sẽ phản hồi qua tài khoản của bạn, nên hệ thống cần xác nhận người gửi trước.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )}

    {loggedIn && (
      <div id="my-reports" className="mt-6 scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Khiếu nại của bạn</h3>
              <p className="text-sm text-slate-500">
                Tóm tắt trạng thái hiện tại. Chi tiết đầy đủ nằm trong trang riêng để không làm rối trang khóa học.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenReports}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            <MessageSquare size={17} /> Mở trang khiếu nại
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {reportsLoading ? (
            "Đang tải trạng thái khiếu nại..."
          ) : myReports.length === 0 ? (
            "Bạn chưa gửi khiếu nại nào cho khóa học này."
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {myReports.length} khiếu nại
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {courseTitle || myReports[0]?.courseName || "Khóa học hiện tại"}
                </span>
              </div>
              <p className="mt-3 text-slate-700">
                {myReports[0]?.adminResponse || myReports[0]?.refundRecommendationReason
                  ? myReports[0]?.adminResponse || myReports[0]?.refundRecommendationReason
                  : "Quản trị viên đang xử lý và sẽ thông báo khi có kết luận."}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Xem toàn bộ lịch sử, tệp đính kèm và phản hồi trong trang khiếu nại riêng.
              </p>
            </>
          )}
        </div>
      </div>
    )}
  </div>
);

export default React.memo(CourseReportPanel);
