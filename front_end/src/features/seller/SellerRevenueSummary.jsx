import MetricCard from "../../shared/components/cards/MetricCard";
import { formatVnd as formatMoney } from "../../shared/utils/formatters";

export default function SellerRevenueSummary({ sellerStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <MetricCard label="Tổng doanh thu" value={formatMoney(sellerStats?.totalRevenue || 0)} tone="emerald" />
      <MetricCard label="Tổng đơn hàng" value={(sellerStats?.totalOrders || 0).toLocaleString("vi-VN")} tone="blue" />
      <MetricCard label="Tổng học viên" value={(sellerStats?.totalStudents || 0).toLocaleString("vi-VN")} tone="sky" />
      <MetricCard label="Đánh giá trung bình" value={`${sellerStats?.averageRating?.toFixed(1) || "0.0"}★`} tone="amber" />
    </div>
  );
}
