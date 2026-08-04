import { motion } from "framer-motion";
import { FiCheck, FiEye, FiStar, FiX } from "react-icons/fi";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import { formatVND } from "../../utils/formatVND";
import {
  courseReviewStatusLabel,
  courseReviewStatusTone,
} from "./courseReviewView";

const CourseReviewStatus = ({ status }) => (
  <StatusBadge tone={courseReviewStatusTone[status] || "slate"}>
    {courseReviewStatusLabel[status] || status}
  </StatusBadge>
);

export default function AdminCourseReviewCard({
  request,
  rowNumber,
  formatDate,
  onApprove,
  onReject,
  onView,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:border-blue-200"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
              {rowNumber}
            </div>
            <img
              src={request.course.thumbnail}
              alt={request.course.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{request.course.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <CourseReviewStatus status={request.status} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Mã yêu cầu: {request.requestId}</div>
            <div className="text-sm text-slate-500">Gửi lúc: {formatDate(request.submittedAt)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-slate-950">Thông tin khóa học</h4>
            <div className="space-y-1 text-sm text-slate-600">
              <div>Danh mục: {request.course.category}</div>
              <div>Cấp độ: {request.course.level}</div>
              <div>Giá: {formatVND(request.course.price)}</div>
              <div>Thời lượng: {request.course.duration}</div>
              <div>Số bài học: {request.course.lessons}</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Mô tả: </span>
              {request.course.description || "Chưa có mô tả"}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-slate-950">Thông tin giảng viên</h4>
            <div className="mb-3 flex items-center gap-3">
              <img
                src={request.seller.avatar}
                alt={request.seller.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-slate-950">{request.seller.name}</div>
                <div className="text-sm text-slate-500">
                  {request.seller.email || "Chưa cập nhật email"}
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-400" />
                Đánh giá: {request.seller.rating != null ? `${request.seller.rating}/5` : "Chưa có đánh giá"}
              </div>
              <div>Tổng khóa học: {request.seller.totalCourses ?? "Chưa có dữ liệu"}</div>
              <div>Tổng học viên: {request.seller.totalStudents ?? "Chưa có dữ liệu"}</div>
            </div>
          </div>
        </div>

        {request.type === "update" && request.changes && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium text-gray-900">Các thay đổi:</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              {request.changes.map((change, index) => (
                <li key={`${change}-${index}`}>{change}</li>
              ))}
            </ul>
          </div>
        )}

        {request.type === "delete" && request.deleteReason && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium text-gray-900">Lý do xóa:</h4>
            <p className="text-sm text-gray-600">{request.deleteReason}</p>
          </div>
        )}

        {request.status === "rejected" && request.rejectionReason && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <h4 className="mb-1 font-medium text-red-800">Lý do từ chối:</h4>
            <p className="text-sm text-red-600">{request.rejectionReason}</p>
            <p className="mt-1 text-xs text-red-500">
              Từ chối bởi: {request.rejectedBy} - {formatDate(request.rejectedAt)}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          <ActionButton onClick={() => onView(request)} icon={<FiEye size={16} />} tone="slate">
            Xem chi tiết
          </ActionButton>

          {request.status === "pending" && (
            <>
              <ActionButton onClick={() => onApprove(request)} icon={<FiCheck size={16} />} tone="emerald">
                Duyệt
              </ActionButton>
              <ActionButton onClick={() => onReject(request)} icon={<FiX size={16} />} tone="rose">
                Từ chối
              </ActionButton>
            </>
          )}

          {request.status === "approved" && (
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
              <FiCheck size={16} />
              Đã duyệt
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
