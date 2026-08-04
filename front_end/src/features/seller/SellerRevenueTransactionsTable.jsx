import { FiSearch } from "react-icons/fi";
import AdminPagination from "../../component/AdminPagination";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import DataTable from "../../shared/components/table/DataTable";
import { formatDateOnly, formatVnd as formatMoney } from "../../shared/utils/formatters";
import { operationStatusTone } from "./sellerDashboardView";
import { revenueTransactionColumnWidths, revenueTransactionColumns } from "./sellerRevenueView";

export default function SellerRevenueTransactionsTable({
  keyword,
  onKeywordChange,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  totalItems,
  transactions,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
          <p className="text-sm text-gray-500">
            Danh sách đơn hàng đã thanh toán của các khóa học thuộc người bán.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <span className="text-sm font-semibold text-gray-500">{totalItems.toLocaleString("vi-VN")} giao dịch</span>
          <div className="relative w-full sm:w-72">
            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Tìm đơn, học viên, khóa học..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <DataTable
        columns={revenueTransactionColumns}
        colWidths={revenueTransactionColumnWidths}
        emptyMessage="Chưa có giao dịch đã thanh toán."
        minWidth={1240}
      >
        {transactions.map((item, index) => (
          <tr key={item.orderId}>
            <td className="whitespace-nowrap p-4 text-sm text-gray-500">
              {(page - 1) * pageSize + index + 1}
            </td>
            <td className="whitespace-nowrap p-4 text-sm font-semibold text-gray-800">#{item.orderId}</td>
            <td className="whitespace-nowrap p-4 text-sm text-gray-600">{formatDateOnly(item.dateOrder)}</td>
            <td className="whitespace-nowrap p-4 text-sm text-gray-700">{item.learnerName || "—"}</td>
            <td className="p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-900">{item.courseName || "—"}</p>
              <p className="text-xs text-gray-500">Mã khóa: {item.courseId || "—"}</p>
            </td>
            <td className="whitespace-nowrap p-4 text-right text-sm font-bold text-blue-700">
              {formatMoney(item.amount)}
            </td>
            <td className="whitespace-nowrap p-4">
              <StatusBadge tone={operationStatusTone[item.status] || "emerald"}>
                {item.status || "PAID"}
              </StatusBadge>
            </td>
          </tr>
        ))}
      </DataTable>

      <AdminPagination
        currentPage={page}
        itemLabel="giao dịch"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSize={pageSize}
        totalItems={totalItems}
      />
    </div>
  );
}
