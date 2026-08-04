export const complaintCategoryLabel = {
  TECHNICAL: "Lỗi kỹ thuật",
  PAYMENT: "Thanh toán",
  CONTENT: "Nội dung khóa học",
  QUALITY: "Chất lượng khóa học",
  OTHER: "Vấn đề khác",
};

export const complaintPriorityLabel = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

export const complaintPriorityTone = {
  HIGH: "rose",
  MEDIUM: "amber",
  LOW: "emerald",
  NORMAL: "slate",
};

export const complaintStatusLabel = {
  PENDING: "Chờ admin xem",
  SELLER_ACTION_REQUIRED: "Chờ người bán xử lý",
  SELLER_FIXED: "Người bán đã phản hồi",
  RESOLVED: "Đã xử lý",
  REFUND_RECOMMENDED: "Đề xuất hoàn tiền",
};

export const complaintStatusTone = {
  RESOLVED: "emerald",
  SELLER_ACTION_REQUIRED: "orange",
  SELLER_FIXED: "blue",
  REFUND_RECOMMENDED: "rose",
  PENDING: "slate",
};

export const complaintStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  ...Object.entries(complaintStatusLabel).map(([value, label]) => ({ value, label })),
];

export const normalizeComplaintPriority = (value) => String(value || "NORMAL").toUpperCase();
export const normalizeComplaintStatus = (value) => String(value || "PENDING").toUpperCase();

export const isVideoEvidenceUrl = (url = "") =>
  /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");

export const toComplaint = (item = {}) => ({
  id: String(item.id),
  userName: item.userFullName || "Chưa có tên",
  userEmail: item.userEmail || "Chưa có email",
  courseId: item.courseId,
  courseTitle: item.courseName || "Khóa học không xác định",
  date: item.date,
  status: normalizeComplaintStatus(item.status),
  priority: normalizeComplaintPriority(item.priority),
  category: item.category || "OTHER",
  subject: item.subject || "Không có tiêu đề",
  detail: item.detail || "Không có nội dung",
  adminResponse: item.adminResponse || "",
  resolvedAt: item.resolvedAt,
  resolvedByName: item.resolvedByName || "",
  sellerName: item.sellerName || "Chưa có tên người bán",
  sellerEmail: item.sellerEmail || "",
  sellerActionRequest: item.sellerActionRequest || "",
  sellerActionRequestedAt: item.sellerActionRequestedAt,
  sellerActionRequestedByName: item.sellerActionRequestedByName || "",
  sellerResponse: item.sellerResponse || "",
  sellerRespondedAt: item.sellerRespondedAt,
  sellerFixedAt: item.sellerFixedAt,
  refundRecommendedAt: item.refundRecommendedAt,
  refundRecommendationReason: item.refundRecommendationReason || "",
  attachmentUrl: item.attachmentUrl || "",
});

export const complaintInitialResponse = (complaint = {}) =>
  complaint.adminResponse ||
  complaint.sellerActionRequest ||
  complaint.refundRecommendationReason ||
  "";
