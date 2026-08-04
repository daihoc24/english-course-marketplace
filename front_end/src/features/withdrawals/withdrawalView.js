import { formatWithdrawalText, withdrawalSourceLabel } from "../../utils/withdrawalText";

export { formatWithdrawalText, withdrawalSourceLabel };

export const withdrawalTableColumns = [
  "STT",
  "Ngày gửi",
  "Giảng viên",
  "Số tiền",
  "Tài khoản nhận",
  "Ghi chú",
  "Trạng thái",
  "Kết quả xử lý",
  "Thao tác",
];

export const withdrawalTableColumnWidths = [
  "70px",
  "160px",
  "200px",
  "180px",
  "250px",
  "230px",
  "150px",
  "260px",
  "180px",
];

export const withdrawalStatusFilterOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "REQUIRES_ATTENTION", label: "Cần rà soát" },
  { value: "PAID", label: "Đã chi trả" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "FAILED", label: "Lỗi chi trả" },
];

export const withdrawalActionLabel = {
  PAID: "Xác nhận chi trả",
  APPROVED: "Xác nhận chi trả",
  REQUIRES_ATTENTION: "Cần kiểm tra thêm",
  REJECTED: "Từ chối",
  FAILED: "Báo thất bại",
};

export const withdrawalStatusLabel = {
  PENDING: "Đang chờ",
  PROCESSING: "Chờ xác nhận",
  PAID: "Đã chi trả",
  APPROVED: "Đã chi trả",
  REQUIRES_ATTENTION: "Cần rà soát",
  REJECTED: "Đã từ chối",
  FAILED: "Lỗi chi trả",
};

export const withdrawalStatusTone = {
  PENDING: "amber",
  PROCESSING: "sky",
  PAID: "emerald",
  APPROVED: "emerald",
  REQUIRES_ATTENTION: "orange",
  REJECTED: "rose",
  FAILED: "rose",
};

export const withdrawalMethodLabel = {
  BANK: "Ngân hàng",
  PAYPAL: "PayPal",
};

export const getWithdrawalSourceTone = (source) => (source === "AUTO" ? "blue" : "slate");

export const getWithdrawalSummary = (withdrawals, totalWithdrawals) => {
  const pendingItems = withdrawals.filter((item) => item.status === "PENDING");
  const attentionItems = withdrawals.filter((item) => item.status === "REQUIRES_ATTENTION");
  const paidItems = withdrawals.filter((item) => ["PAID", "APPROVED"].includes(item.status));
  const rejectedItems = withdrawals.filter((item) => ["REJECTED", "FAILED"].includes(item.status));

  return {
    total: totalWithdrawals,
    pending: pendingItems.length,
    attention: attentionItems.length,
    paid: paidItems.length,
    rejected: rejectedItems.length,
  };
};
