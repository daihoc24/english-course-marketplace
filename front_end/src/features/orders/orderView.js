export const orderStatusLabel = {
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
  PENDING: "Đang xử lý",
  FAILED: "Thất bại",
};

export const orderStatusTone = {
  PAID: "emerald",
  REFUNDED: "slate",
  PENDING: "amber",
  FAILED: "rose",
};

export const normalizeOrderStatus = (status) => String(status || "UNKNOWN").toUpperCase();

export const orderStatusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "PENDING", label: "Đang xử lý" },
  { value: "FAILED", label: "Thất bại" },
];
