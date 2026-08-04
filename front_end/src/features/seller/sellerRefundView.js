export const sellerRefundTableColumns = [
  "STT",
  "Mã đơn",
  "Học viên",
  "Khóa học",
  "Ngày gửi",
  "Trạng thái",
  "Lý do",
  "Ghi chú admin",
  "Kết quả xử lý",
  "Minh chứng",
];

export const sellerRefundColumnWidths = [
  "64px",
  "96px",
  "160px",
  "220px",
  "150px",
  "150px",
  "260px",
  "220px",
  "260px",
  "130px",
];

export const sellerRefundStatusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ admin xem" },
  { value: "REQUIRES_ATTENTION", label: "Cần rà soát" },
  { value: "APPROVED", label: "Đã hoàn tất" },
  { value: "REJECTED", label: "Không duyệt" },
];

export const getSellerRefundSummary = (refunds, totalRefunds) => ({
  total: totalRefunds,
  pending: refunds.filter((item) => ["PENDING", "REQUIRES_ATTENTION"].includes(item.status)).length,
  approved: refunds.filter((item) => item.status === "APPROVED").length,
  rejected: refunds.filter((item) => item.status === "REJECTED").length,
});
