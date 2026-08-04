import { formatVnd as formatMoney } from "../../shared/utils/formatters";
import { getRevenueChartState } from "./sellerRevenueView";

export default function SellerRevenueChart({ revenueData }) {
  const { currentMonthValue, hasRevenueData, maxValue } = getRevenueChartState(revenueData);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Biểu đồ doanh thu 6 tháng gần nhất</h3>
          <p className="text-sm text-gray-500">Dữ liệu được nhóm theo tháng từ các đơn hàng đã thanh toán.</p>
        </div>
        <span className="text-sm font-semibold text-blue-700">Tháng này: {formatMoney(currentMonthValue)}</span>
      </div>

      <div className="flex h-52 items-end gap-3 rounded-xl bg-slate-50 px-4 py-5">
        {!hasRevenueData ? (
          <div className="flex h-full flex-1 items-center justify-center text-sm text-gray-500">
            Chưa có dữ liệu doanh thu theo tháng.
          </div>
        ) : (
          revenueData.map((item) => (
            <div key={item.month} className="flex flex-1 flex-col items-center">
              <div
                className="flex w-full max-w-12 items-end justify-center rounded-t-lg bg-gradient-to-t from-blue-700 to-sky-400 transition-all duration-500"
                style={{ height: `${Math.max(8, (item.value / maxValue) * 136)}px` }}
                title={`${item.label}: ${formatMoney(item.value)} - ${item.orders} đơn`}
              />
              <span className="mt-2 text-xs font-medium text-gray-500">{item.month}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
