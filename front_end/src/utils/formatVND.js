export function formatVND(price) {
  const amount = Number(price || 0);
  if (amount <= 0) return "Miễn phí";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
