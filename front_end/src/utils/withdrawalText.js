export const withdrawalSourceLabel = {
  AUTO: "Chi trả tự động",
  MANUAL: "Yêu cầu thủ công",
};

export const payoutAccountStatusLabel = {
  VERIFIED: "Đã xác minh",
  PENDING: "Chờ xác minh",
  INVALID: "Cần kiểm tra",
};

const textReplacements = [
  ["OPEN_REFUND: seller dang co refund/dispute mo", "Người bán đang có yêu cầu hoàn tiền hoặc khiếu nại đang mở"],
  ["Nguoi ban dang co yeu cau hoan tien hoac khieu nai dang mo", "Người bán đang có yêu cầu hoàn tiền hoặc khiếu nại đang mở"],
  ["SELLER_INACTIVE: tai khoan seller dang bi khoa", "Tài khoản người bán đang bị khóa"],
  ["Tai khoan nguoi ban dang bi khoa", "Tài khoản người bán đang bị khóa"],
  ["MISSING_PAYOUT_ACCOUNT: seller chua cau hinh tai khoan nhan tien demo", "Người bán chưa cấu hình tài khoản nhận tiền"],
  ["Nguoi ban chua cau hinh tai khoan nhan tien demo", "Người bán chưa cấu hình tài khoản nhận tiền"],
  ["PAYOUT_ACCOUNT_NOT_VERIFIED: tai khoan nhan tien chua duoc xac minh", "Tài khoản nhận tiền chưa được xác minh"],
  ["Tai khoan nhan tien chua duoc xac minh", "Tài khoản nhận tiền chưa được xác minh"],
  ["INVALID_PAYOUT_ACCOUNT", "Thông tin nhận tiền chưa hợp lệ"],
  ["Thong tin nhan tien chua hop le", "Thông tin nhận tiền chưa hợp lệ"],
  ["Khoan chi tra cua ban chua the xu ly tu dong", "Khoản chi trả của bạn chưa thể xử lý tự động"],
  ["So tien rut toi thieu la 10.000 VND", "Số tiền rút tối thiểu là 10.000 VND"],
  ["So du kha dung khong du de tao yeu cau rut tien", "Số dư khả dụng không đủ để tạo yêu cầu rút tiền"],
  ["Chi tra tu dong demo - da dat dieu kien", "Chi trả tự động - đã đạt điều kiện"],
  ["Chi tra tu dong demo", "Chi trả tự động"],
  ["Chi trả tự động demo", "Chi trả tự động"],
  ["Chi tra tu dong can xu ly", "Chi trả tự động cần admin kiểm tra"],
  ["Chi tra tu dong can bo sung thong tin", "Chi trả tự động cần bổ sung thông tin"],
  ["Da ghi nhan chuyen khoan ao", "Đã ghi nhận chuyển khoản"],
  ["Đã ghi nhận chuyển khoản ảo", "Đã ghi nhận chuyển khoản"],
  ["VND den", "VND đến"],
  ["Ma giao dich", "Mã giao dịch"],
  ["tai khoan nhan tien demo", "tài khoản nhận tiền"],
  ["MB Bank Demo", "MB Bank"],
  ["Bo phan thanh toan", "Bộ phận thanh toán"],
  ["Vui long", "Vui lòng"],
  ["Yeu cau rut tien nay da duoc xu ly", "Yêu cầu rút tiền này đã được xử lý"],
  ["Vui long nhap ten chu tai khoan", "Vui lòng nhập tên chủ tài khoản"],
  ["Vui long nhap so tai khoan", "Vui lòng nhập số tài khoản"],
];

export const formatWithdrawalText = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  return textReplacements.reduce(
    (current, [from, to]) => current.split(from).join(to),
    text
  );
};
