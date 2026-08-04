import { motion } from "framer-motion";
import { FiBook, FiClock, FiEdit2, FiEye, FiTrash2, FiUsers } from "react-icons/fi";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import { formatVND } from "../../utils/formatVND";
import {
  courseApprovalLabel,
  courseApprovalTone,
} from "./sellerDashboardView";

export function CourseApprovalBadge({ status }) {
  return (
    <StatusBadge tone={courseApprovalTone[status] || "slate"}>
      {courseApprovalLabel[status] || status}
    </StatusBadge>
  );
}

function CourseStateAction({ course, onResubmit }) {
  if (course.approvalStatus === "rejected") {
    return (
      <button
        type="button"
        onClick={() => onResubmit(course.id)}
        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
      >
        Gửi lại
      </button>
    );
  }

  const stateClass = {
    approved: "bg-green-100 text-green-700",
    draft: "bg-slate-100 text-slate-700",
    pending: "bg-yellow-100 text-yellow-700",
  }[course.approvalStatus] || "bg-slate-100 text-slate-700";

  const stateLabel = {
    approved: "Đang hoạt động",
    draft: "Bản nháp",
    pending: "Đang chờ phê duyệt",
  }[course.approvalStatus] || "Chưa cập nhật";

  return (
    <div className={`flex-1 rounded-lg px-3 py-2 text-center text-sm ${stateClass}`}>
      {stateLabel}
    </div>
  );
}

export function SellerCourseCard({
  course,
  indexLabel,
  onDelete,
  onEdit,
  onResubmit,
  onView,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="relative">
        <img
          src={course.image}
          alt={course.name}
          className="h-48 w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow">
          STT {indexLabel}
        </span>
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            type="button"
            onClick={() => onView(course)}
            className="rounded-full bg-white p-2 shadow transition-colors hover:bg-gray-100"
            aria-label="Xem khóa học"
          >
            <FiEye className="text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(course)}
            className="rounded-full bg-white p-2 shadow transition-colors hover:bg-gray-100"
            title="Chỉnh sửa khóa học"
            aria-label="Chỉnh sửa khóa học"
          >
            <FiEdit2 className="text-blue-600" />
          </button>
          {["draft", "rejected"].includes(course.approvalStatus) && (
            <button
              type="button"
              onClick={() => onDelete(course.id)}
              className="rounded-full bg-white p-2 shadow transition-colors hover:bg-gray-100"
              title="Xóa khóa học"
              aria-label="Xóa khóa học"
            >
              <FiTrash2 className="text-red-600" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
            {course.level}
          </span>
          <CourseApprovalBadge status={course.approvalStatus} />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-800">{course.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{course.description}</p>

        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FiClock />
            <span>{course.totalHour} giờ</span>
          </div>
          <div className="flex items-center gap-1">
            <FiUsers />
            <span>{course.students} học viên</span>
          </div>
          <div className="flex items-center gap-1">
            <FiBook />
            <span>{course.lessons} bài học</span>
          </div>
        </div>

        {course.approvalStatus === "rejected" && course.rejectionReason && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              <strong>Lý do từ chối:</strong> {course.rejectionReason}
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {formatVND(course.price)}
            </span>
            {course.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatVND(course.originalPrice)}
              </span>
            )}
          </div>
          {course.rating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">★★★★★</span>
              <span className="text-sm text-gray-600">{course.rating}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <CourseStateAction course={course} onResubmit={onResubmit} />
        </div>
      </div>
    </motion.div>
  );
}


