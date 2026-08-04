import { FiSearch } from "react-icons/fi";
import AdminPagination from "../../component/AdminPagination";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import { formatDateTime, formatVnd as formatMoney } from "../../shared/utils/formatters";
import { formatWithdrawalText, withdrawalSourceLabel } from "../../utils/withdrawalText";
import {
  operationStatusTone,
  withdrawalStatusLabel,
  withdrawalStatusOptions,
} from "./sellerDashboardView";

export default function SellerWithdrawalHistory({
  onKeywordChange,
  onPageChange,
  onPageSizeChange,
  onStatusFilterChange,
  totalWithdrawals = 0,
  withdrawalKeyword = "",
  withdrawalPage = 1,
  withdrawalPageSize = 10,
  withdrawalStatusFilter = "",
  withdrawals = [],
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Lịch sử yêu cầu</h2>
            <p className="text-sm text-gray-500">{totalWithdrawals.toLocaleString("vi-VN")} yêu cầu rút tiền</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <input
                value={withdrawalKeyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                placeholder="Tìm tài khoản, ngân hàng, ghi chú..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <select
              value={withdrawalStatusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              {withdrawalStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">STT</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Số tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tài khoản</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ngày gửi</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                  Chưa có yêu cầu rút tiền
                </td>
              </tr>
            ) : (
              withdrawals.map((item, index) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {(withdrawalPage - 1) * withdrawalPageSize + index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-800">
                    {formatMoney(item.amountVnd)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <p className="font-medium">{item.accountName || "-"}</p>
                    <p className="text-xs text-gray-500">
                      {[item.bankName, item.accountNumber].filter(Boolean).join(" - ") || item.method}
                    </p>
                    {item.adminNote && (
                      <p className="mt-1 text-xs text-rose-600">{formatWithdrawalText(item.adminNote)}</p>
                    )}
                    {item.failureReason && (
                      <p className="mt-1 text-xs text-orange-600">
                        Lý do cần kiểm tra: {formatWithdrawalText(item.failureReason)}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {formatDateTime(item.requestedAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge tone={operationStatusTone[item.status] || "amber"}>
                      {withdrawalStatusLabel[item.status] || item.status}
                    </StatusBadge>
                    {item.source && (
                      <p className="mt-1 text-xs text-gray-400">
                        {withdrawalSourceLabel[item.source] || item.source}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={withdrawalPage}
        itemLabel="yêu cầu"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSize={withdrawalPageSize}
        totalItems={totalWithdrawals}
      />
    </div>
  );
}
