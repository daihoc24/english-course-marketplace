export const sellerCategoryLabels = {
  1: "IELTS",
  2: "Tiếng Anh thương mại",
  3: "Tiếng Anh thiếu nhi",
  4: "Giao tiếp",
  5: "Ngữ pháp",
  6: "Tiếng Anh tổng quát",
};

export const sellerLevelLabels = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  "Upper Intermediate": "Trung cấp cao",
  Advanced: "Nâng cao",
};

export const sellerLevelOptions = [
  { value: "", label: "Tất cả cấp độ" },
  { value: "Beginner", label: "Cơ bản" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Upper Intermediate", label: "Trung cấp cao" },
  { value: "Advanced", label: "Nâng cao" },
];

export const courseApprovalLabel = {
  approved: "Đang bán",
  pending: "Chờ duyệt",
  draft: "Bản nháp",
  rejected: "Từ chối",
};

export const courseApprovalTone = {
  approved: "emerald",
  pending: "amber",
  draft: "slate",
  rejected: "rose",
};

export const courseApprovalOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "approved", label: "Đang bán" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "draft", label: "Bản nháp" },
  { value: "rejected", label: "Từ chối" },
];

export const withdrawalStatusLabel = {
  PENDING: "Đang chờ",
  PROCESSING: "Đang xử lý",
  PAID: "Đã chi trả",
  APPROVED: "Đã chi trả",
  REQUIRES_ATTENTION: "Cần rà soát",
  REJECTED: "Đã từ chối",
  FAILED: "Lỗi chi trả",
};

export const refundStatusLabel = {
  PENDING: "Đang chờ",
  APPROVED: "Đã cộng tín dụng",
  REQUIRES_ATTENTION: "Cần rà soát",
  REJECTED: "Đã từ chối",
};

export const refundGatewayStatusLabel = {
  COMPLETED: "Đã gửi lệnh hoàn tiền",
  CREDITED: "Đã cộng tín dụng",
  REJECTED: "Không hoàn tiền",
  INSUFFICIENT_SELLER_BALANCE: "Ví seller chưa đủ",
};

export const operationStatusTone = {
  APPROVED: "emerald",
  PAID: "emerald",
  PROCESSING: "sky",
  COMPLETED: "blue",
  CREDITED: "emerald",
  PENDING: "amber",
  REQUIRES_ATTENTION: "orange",
  REJECTED: "rose",
  FAILED: "rose",
  INSUFFICIENT_SELLER_BALANCE: "orange",
};

export const withdrawalStatusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "PAID", label: "Đã chi trả" },
  { value: "REQUIRES_ATTENTION", label: "Cần rà soát" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "FAILED", label: "Lỗi chi trả" },
];

export const refundStatusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "REQUIRES_ATTENTION", label: "Cần rà soát" },
  { value: "APPROVED", label: "Đã cộng tín dụng" },
  { value: "REJECTED", label: "Đã từ chối" },
];

export const qnaStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "OPEN", label: "Chưa trả lời" },
  { value: "ANSWERED", label: "Đã trả lời" },
  { value: "RESOLVED", label: "Đã giải quyết" },
];
