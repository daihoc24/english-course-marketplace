export const SELLER_REPORT_PAGE_SIZE = 5;

export const sellerReportStatusLabels = {
  PENDING: "Admin đang xử lý",
  SELLER_ACTION_REQUIRED: "Cần khắc phục",
  SELLER_FIXED: "Đã cập nhật",
  RESOLVED: "Đã xử lý",
  REFUND_RECOMMENDED: "Đề xuất hoàn tiền",
};

export const sellerReportCategoryLabels = {
  TECHNICAL: "Lỗi kỹ thuật",
  PAYMENT: "Thanh toán",
  CONTENT: "Nội dung khóa học",
  QUALITY: "Chất lượng giảng dạy",
  OTHER: "Vấn đề khác",
};

export const sellerReportPriorityLabels = {
  LOW: "Ưu tiên thấp",
  NORMAL: "Ưu tiên thường",
  HIGH: "Ưu tiên cao",
};

export const sellerReportStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SELLER_ACTION_REQUIRED", label: "Cần khắc phục" },
  { value: "SELLER_FIXED", label: "Đã cập nhật" },
  { value: "RESOLVED", label: "Đã xử lý" },
  { value: "REFUND_RECOMMENDED", label: "Đề xuất hoàn tiền" },
];

export const normalizeSellerReportStatus = (value) => String(value || "PENDING").toUpperCase();

export const formatSellerReportDate = (value) => {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const toSellerReport = (item = {}) => ({
  ...item,
  id: String(item.id),
  status: normalizeSellerReportStatus(item.status),
  courseName: item.courseName || "Khóa học không xác định",
  subject: item.subject || "Không có tiêu đề",
  detail: item.detail || "Không có nội dung",
  category: item.category || "OTHER",
  priority: String(item.priority || "NORMAL").toUpperCase(),
});

export const getSellerReportStats = (reports, totalReports) => {
  const required = reports.filter((item) => item.status === "SELLER_ACTION_REQUIRED").length;
  const fixed = reports.filter((item) => item.status === "SELLER_FIXED" || item.status === "RESOLVED").length;
  return { total: totalReports, required, fixed };
};

export const sellerReportStatusClassName = (status) => {
  switch (status) {
    case "SELLER_ACTION_REQUIRED":
      return "bg-orange-50 text-orange-700 ring-orange-200";
    case "SELLER_FIXED":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "REFUND_RECOMMENDED":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
};

export const sellerReportPriorityClassName = (priority) => {
  switch (String(priority || "NORMAL").toUpperCase()) {
    case "HIGH":
      return "bg-red-50 text-red-700 ring-red-200";
    case "LOW":
      return "bg-slate-50 text-slate-600 ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
};

export const isSellerReportVideoUrl = (url) => {
  const value = String(url || "");
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value) || value.includes("/video/upload/");
};
