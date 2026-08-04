import { Link } from "react-router-dom";
import AdminPagination from "../../component/AdminPagination";
import { formatVnd as formatMoney } from "../../shared/utils/formatters";

export default function SellerWalletSummary({
  attentionCount = 0,
  availableBalance = 0,
  grossWalletAmount = 0,
  inFlightAmount = 0,
  onWalletPageChange,
  onWalletPageSizeChange,
  openRefundCount = 0,
  paidOutAmount = 0,
  refundHoldAmount = 0,
  totalWalletTransactions = 0,
  walletBalance = 0,
  walletPage = 1,
  walletPageSize = 4,
  walletTransactions = [],
}) {
  return (
    <section className="mb-6 rounded-lg bg-white p-5 shadow">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Ví người bán</h2>
          <p className="text-sm text-gray-500">
            Ví chỉ hiển thị số tiền còn nằm trên hệ thống. Tiền đã chi trả sẽ nằm trong lịch sử rút tiền bên dưới.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/seller/wallet/top-up"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Nạp tiền
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-sm text-indigo-700">Còn trong ví</p>
          <p className="mt-2 text-2xl font-bold text-indigo-700">{formatMoney(walletBalance)}</p>
          <p className="mt-1 text-xs text-indigo-700">
            Đã ghi nhận {formatMoney(grossWalletAmount)}
            {paidOutAmount > 0 ? `, đã chi trả ${formatMoney(paidOutAmount)}` : ""}
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm text-blue-700">Có thể rút</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{formatMoney(availableBalance)}</p>
          <p className="mt-1 text-xs text-blue-700">Sau khi trừ tiền tạm giữ</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">Tạm giữ</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{formatMoney(refundHoldAmount)}</p>
          <p className="mt-1 text-xs text-amber-700">{openRefundCount} yêu cầu hoàn tiền/khiếu nại, chưa cho rút</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">Chờ chi trả</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{formatMoney(inFlightAmount)}</p>
        </div>
      </div>

      {attentionCount > 0 && (
        <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Có {attentionCount} mục cần admin kiểm tra trước khi rút hoặc hoàn tiền.
        </div>
      )}
      {paidOutAmount > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {formatMoney(paidOutAmount)} đã được đánh dấu là đã chi trả, nên khoản này không còn nằm trong ví hiện tại.
        </div>
      )}

      {walletTransactions.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">Nạp ví gần đây</p>
            <Link to="/seller/wallet/top-up" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
              Nạp thêm
            </Link>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {walletTransactions.map((transaction, index) => (
              <div key={transaction.id} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800">{formatMoney(transaction.amountVnd)}</span>
                  <span className="text-xs font-medium text-emerald-700">
                    STT {(walletPage - 1) * walletPageSize + index + 1}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{transaction.reference || transaction.description}</p>
              </div>
            ))}
          </div>
          <AdminPagination
            currentPage={walletPage}
            itemLabel="giao dịch ví"
            onPageChange={onWalletPageChange}
            onPageSizeChange={onWalletPageSizeChange}
            pageSize={walletPageSize}
            pageSizeOptions={[4, 8, 12]}
            totalItems={totalWalletTransactions}
          />
        </div>
      )}
    </section>
  );
}
