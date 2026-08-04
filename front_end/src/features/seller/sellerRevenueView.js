export const revenueTransactionColumns = [
  "STT",
  "Mã đơn",
  "Ngày",
  "Học viên",
  "Khóa học",
  "Số tiền",
  "Trạng thái",
];

export const revenueTransactionColumnWidths = [
  "70px",
  "120px",
  "150px",
  "220px",
  "360px",
  "170px",
  "150px",
];

export const normalizeMonthlyRevenue = (monthlyData = []) =>
  monthlyData.map((item) => ({
    month: item.month?.includes("-") ? item.month.slice(5) : item.month,
    label: item.month,
    value: Number(item.revenue || 0),
    orders: Number(item.orders || 0),
  }));

export const getRevenueChartState = (revenueData) => ({
  currentMonthValue: revenueData[revenueData.length - 1]?.value || 0,
  hasRevenueData: revenueData.some((item) => item.value > 0),
  maxValue: Math.max(1, ...revenueData.map((item) => item.value)),
});
