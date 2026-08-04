import { cleanOperationalText } from "../../utils/displayText";

export const refundTableColumns = [
  "STT",
  "Ngày gửi",
  "Học viên",
  "Khóa học",
  "Lý do",
  "Minh chứng",
  "Kênh thanh toán",
  "Trạng thái",
  "Ghi chú admin",
  "Kết quả xử lý",
  "Thao tác",
];

export const refundTableColumnWidths = [
  "64px",
  "140px",
  "170px",
  "220px",
  "260px",
  "145px",
  "175px",
  "150px",
  "200px",
  "230px",
  "130px",
];

export const refundStatusFilterOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ admin xem" },
  { value: "REQUIRES_ATTENTION", label: "Cần rà soát" },
  { value: "APPROVED", label: "Đã hoàn tất" },
  { value: "REJECTED", label: "Không duyệt" },
];

export const refundActionLabel = {
  APPROVED: "Cộng tín dụng",
  REJECTED: "Từ chối hoàn tiền",
};

export const refundStatusLabel = {
  PENDING: "Chờ admin xem",
  REQUIRES_ATTENTION: "Cần kiểm tra thêm",
  APPROVED: "Đã cộng tín dụng",
  REJECTED: "Đã từ chối",
};

export const refundCompactStatusLabel = {
  PENDING: "Chờ duyệt",
  REQUIRES_ATTENTION: "Cần rà soát",
  APPROVED: "Đã hoàn tất",
  REJECTED: "Không duyệt",
};

export const refundStatusTone = {
  PENDING: "amber",
  REQUIRES_ATTENTION: "orange",
  APPROVED: "emerald",
  REJECTED: "rose",
};

export const gatewayProviderLabel = {
  DEMO: "Nội bộ",
  VNPAY: "VNPay",
  PAYPAL: "PayPal",
  LEARNING_CREDIT: "Tín dụng học tập",
};

export const gatewayProviderTone = {
  DEMO: "slate",
  VNPAY: "violet",
  PAYPAL: "sky",
  LEARNING_CREDIT: "emerald",
};

export const gatewayStatusLabel = {
  COMPLETED: "Đã gửi lệnh hoàn tiền",
  CREDITED: "Đã cộng tín dụng học tập",
  REJECTED: "Không hoàn tiền",
  INSUFFICIENT_SELLER_BALANCE: "Ví người bán chưa đủ tiền",
};

const systemRefundReasonFragments = [
  "Số dư chưa chi trả của người bán không đủ để hoàn tiền. Cần xử lý thủ công hoặc giữ doanh thu mới để bù.",
  "Ví người bán hiện chưa đủ tiền để hoàn lại cho học viên. Admin cần kiểm tra và xử lý thủ công hoặc giữ doanh thu mới để bù.",
];

export const isVideoEvidenceUrl = (url = "") =>
  /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");

export const getRefundReason = (refund) => cleanOperationalText(refund?.reason, "-");

export const getVisibleRefundAdminNote = (refund) => {
  const note = String(refund?.adminNote || "").trim();
  if (!note) return "";

  return cleanOperationalText(systemRefundReasonFragments
    .reduce((current, fragment) => current.split(fragment).join(""), note)
    .trim());
};

export const getHumanRefundMessage = (refund) => {
  if (refund?.gatewayRefundStatus === "CREDITED") {
    return "Tiền hoàn đã được cộng vào tín dụng học tập của học viên.";
  }

  if (refund?.gatewayRefundStatus === "INSUFFICIENT_SELLER_BALANCE") {
    return "Ví người bán hiện chưa đủ tiền để hoàn lại cho học viên. Admin cần kiểm tra và xử lý thủ công hoặc giữ doanh thu mới để bù.";
  }

  const message = String(refund?.gatewayRefundMessage || "").trim();
  if (!message) return "";

  const replacements = [
    ["Demo refund completed without external gateway", "Đã hoàn tiền."],
    ["VNPay refund completed", "Đã hoàn tiền qua VNPay."],
    ["Số dư chưa chi trả của người bán không đủ để hoàn tiền. Cần xử lý thủ công hoặc giữ doanh thu mới để bù.", "Ví người bán hiện chưa đủ tiền để hoàn lại cho học viên. Admin cần kiểm tra và xử lý thủ công hoặc giữ doanh thu mới để bù."],
  ];

  return cleanOperationalText(replacements.reduce(
    (current, [from, to]) => current.split(from).join(to),
    message
  )
    .replace(/\s+\./g, ".")
    .trim());
};

export const getRefundSummary = (refunds, totalRefunds) => ({
  total: totalRefunds,
  pending: refunds.filter((item) => ["PENDING", "REQUIRES_ATTENTION"].includes(item.status)).length,
  approved: refunds.filter((item) => item.status === "APPROVED").length,
});
