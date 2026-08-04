export const PAGE_SIZE = 5;

export const categoryLabels = {
  TECHNICAL: "Lỗi kỹ thuật",
  PAYMENT: "Thanh toán",
  CONTENT: "Nội dung khóa học",
  QUALITY: "Chất lượng giảng dạy",
  OTHER: "Vấn đề khác",
};

export const priorityLabels = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

export const statusLabels = {
  PENDING: "Admin đang xử lý",
  SELLER_ACTION_REQUIRED: "Admin đang xử lý",
  SELLER_FIXED: "Admin đang xử lý",
  RESOLVED: "Đã xử lý",
  REFUND_RECOMMENDED: "Đề xuất hoàn tiền",
};

export const statusFilterOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PROCESSING", label: "Admin đang xử lý" },
  { value: "RESOLVED", label: "Đã xử lý" },
  { value: "REFUND_RECOMMENDED", label: "Đề xuất hoàn tiền" },
];

export const matchesStatusFilter = (status, filter) => {
  if (filter === "ALL") return true;
  if (filter === "PROCESSING") return ["PENDING", "SELLER_ACTION_REQUIRED", "SELLER_FIXED"].includes(status);
  return status === filter;
};

export const normalizeStatus = (value) => (value || "PENDING").toString().toUpperCase();
export const normalizePriority = (value) => (value || "NORMAL").toString().toUpperCase();
export const isVideoUrl = (url = "") => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");

export const formatDate = (value) => {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa có dữ liệu"
    : date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

export const toReport = (item) => ({
  id: item.id,
  courseId: item.courseId,
  courseName: item.courseName || "Khóa học không xác định",
  subject: item.subject || "Không có tiêu đề",
  detail: item.detail || "Không có nội dung",
  category: item.category || "OTHER",
  priority: normalizePriority(item.priority),
  status: normalizeStatus(item.status),
  date: item.date,
  adminResponse: item.adminResponse || "",
  resolvedAt: item.resolvedAt,
  resolvedByName: item.resolvedByName || "Quản trị viên",
  refundRecommendedAt: item.refundRecommendedAt,
  refundRecommendationReason: item.refundRecommendationReason || "",
  attachmentUrl: item.attachmentUrl || "",
});

export const statusClassName = (status) => {
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "REFUND_RECOMMENDED") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
};

export const priorityClassName = (priority) =>
  ({
    HIGH: "bg-red-50 text-red-700 ring-red-200",
    MEDIUM: "bg-orange-50 text-orange-700 ring-orange-200",
    LOW: "bg-slate-50 text-slate-600 ring-slate-200",
  })[priority] || "bg-blue-50 text-blue-700 ring-blue-200";
