import React from "react";
import { BookOpen, CheckCircle, Clock, Play, Star } from "lucide-react";
import { formatVND } from "../../utils/formatVND";

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "refunded":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const getStatusIcon = (status) => {
  if (status === "completed") return <CheckCircle className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
};

const getStatusText = (status) => {
  switch (status) {
    case "completed":
      return "Đã mua";
    case "pending":
      return "Đang xử lý";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return status;
  }
};

const isRefundAvailable = (refundEligibleUntil) =>
  refundEligibleUntil && new Date(refundEligibleUntil) >= new Date();

const CourseHistoryCard = ({ order, onRefundRequest, onStartLearning }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
      {order.courseImage ? (
        <img
          src={order.courseImage}
          alt={order.courseName}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <BookOpen className="h-16 w-16 text-white opacity-80" />
      )}

      <div className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
        {getStatusIcon(order.status)}
        {getStatusText(order.status)}
      </div>

      {order.status === "completed" && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-3">
          <div className="mb-1 flex items-center justify-between text-sm text-white">
            <span>Tiến độ</span>
            <span>{order.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/30">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>

    <div className="p-6">
      <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-950">
        {order.courseName}
      </h3>

      <p className="mb-3 line-clamp-2 text-sm text-slate-600">
        {order.description || "Khóa học video trực tuyến."}
      </p>

      <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
        <span>Bởi {order.instructor}</span>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{order.rating || 0}</span>
        </div>
        <div className="font-semibold text-blue-600">{formatVND(order.price)}</div>
      </div>

      <div className="mb-4 text-xs text-slate-500">
        {order.completedLessons}/{order.totalLessons} bài học đã học
      </div>

      {order.status === "completed" ? (
        <>
          <button
            type="button"
            onClick={() => onStartLearning(order.id_course)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Play className="h-4 w-4" />
            {order.progress > 0 ? "Tiếp tục học" : "Bắt đầu học"}
          </button>
          {isRefundAvailable(order.refundEligibleUntil) && (
            <button
              type="button"
              onClick={() => onRefundRequest(order)}
              className="mt-2 w-full rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
            >
              Yêu cầu hoàn tiền
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-medium text-slate-500"
        >
          <Clock className="h-4 w-4" />
          {order.status === "refunded" ? "Đã hoàn tiền" : "Đang xử lý thanh toán"}
        </button>
      )}
    </div>
  </div>
);

export default React.memo(CourseHistoryCard);
