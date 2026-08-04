import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { formatVND } from "../../utils/formatVND";
import { sellerLevelLabels } from "./sellerDashboardView";
import { CourseApprovalBadge } from "./SellerCourseCard";

export default function SellerCourseModal({ course, onClose, onSubmitForReview, open }) {
  return (
    <AnimatePresence>
      {open && course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết khóa học</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Đóng chi tiết khóa học"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <img
                src={course.image}
                alt={course.name}
                className="h-48 w-full rounded-lg object-cover"
              />

              <div>
                <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                <p className="mt-2 text-gray-600">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CourseDetail label="Giá" value={formatVND(course.price)} highlight />
                <CourseDetail label="Thời lượng" value={`${course.totalHour} giờ`} />
                <CourseDetail label="Cấp độ" value={sellerLevelLabels[course.level] || course.level} />
                <CourseDetail label="Danh mục" value={course.category} />
                <CourseDetail label="Học viên" value={`${course.students} học viên`} />
                <CourseDetail label="Bài học" value={`${course.lessons} bài học`} />
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  Trạng thái phê duyệt:
                </span>
                <div className="mt-2">
                  <CourseApprovalBadge status={course.approvalStatus} />
                </div>
              </div>

              {course.approvalStatus === "draft" && (
                <button
                  type="button"
                  onClick={() => onSubmitForReview(course)}
                  className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Gửi xét duyệt
                </button>
              )}

              {course.rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">
                    <strong>Lý do từ chối:</strong> {course.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CourseDetail({ highlight = false, label, value }) {
  return (
    <div>
      <span className="text-sm font-medium text-gray-500">{label}:</span>
      <p className={highlight ? "text-lg font-semibold text-blue-600" : ""}>{value}</p>
    </div>
  );
}
