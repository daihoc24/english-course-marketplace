import { lazy, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import SellerService from "../../API/SellerService";
import { ProductContext } from "../../context/ProductContext";
import { loadSwal } from "../../shared/utils/alerts";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import { formatWithdrawalText } from "../../utils/withdrawalText";
import { getSellerIdFromSession } from "./sellerSession";
import { SellerLoadingState } from "./SellerStates";

const SellerWalletSummary = lazy(() => import("./SellerWalletSummary"));
const SellerWithdrawalForm = lazy(() => import("./SellerWithdrawalForm"));
const SellerWithdrawalHistory = lazy(() => import("./SellerWithdrawalHistory"));

const WithdrawSectionFallback = () => (
  <div className="rounded-lg bg-white p-8 text-center text-sm text-slate-500 shadow">
    Đang tải giao diện rút tiền...
  </div>
);

const WithdrawTab = () => {
  const { session } = useContext(ProductContext);
  const sellerId = getSellerIdFromSession(session);
  const [withdrawals, setWithdrawals] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletSummary, setWalletSummary] = useState(null);
  const [withdrawalKeyword, setWithdrawalKeyword] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("");
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalPageSize, setWithdrawalPageSize] = useState(10);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [walletPage, setWalletPage] = useState(1);
  const [walletPageSize, setWalletPageSize] = useState(4);
  const [totalWalletTransactions, setTotalWalletTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [payoutAccount, setPayoutAccount] = useState(null);
  const debouncedWithdrawalKeyword = useDebouncedValue(withdrawalKeyword);
  const [form, setForm] = useState({
    amountVnd: "",
    method: "BANK",
    bankName: "",
    accountName: "",
    accountNumber: "",
    note: "",
  });

  const refundHoldAmount = Number(walletSummary?.refundHoldAmountVnd || 0);
  const paidOutAmount = Number(walletSummary?.paidOutAmountVnd || 0);
  const inFlightAmount = Number(walletSummary?.inFlightAmountVnd || 0);
  const attentionCount = Number(walletSummary?.attentionCount || 0);
  const openRefundCount = Number(walletSummary?.openRefundCount || 0);
  const grossWalletAmount = Number(walletSummary?.grossWalletAmountVnd || 0);
  const walletBalance = Number(walletSummary?.walletBalanceVnd || 0);
  const availableBalance = Number(walletSummary?.availableBalanceVnd || 0);

  const loadWithdrawals = useCallback(async () => {
    if (!sellerId) {
      setError("Vui lòng đăng nhập bằng tài khoản giảng viên");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [withdrawalResponse, summaryResponse, payoutAccountResponse, walletResponse] = await Promise.all([
        SellerService.getWithdrawalRequests(sellerId, {
          page: withdrawalPage - 1,
          size: withdrawalPageSize,
          keyword: debouncedWithdrawalKeyword.trim() || undefined,
          status: withdrawalStatusFilter || undefined,
        }),
        SellerService.getWalletSummary(sellerId),
        SellerService.getPayoutAccount(sellerId),
        SellerService.getWalletTransactions(sellerId, {
          page: walletPage - 1,
          size: walletPageSize,
          status: "COMPLETED",
          type: "TOP_UP",
        }),
      ]);
      const withdrawalPageData = normalizePagePayload(withdrawalResponse);
      const walletPageData = normalizePagePayload(walletResponse);
      setWithdrawals(withdrawalPageData.content);
      setTotalWithdrawals(withdrawalPageData.totalElements);
      setWalletSummary(summaryResponse?.result || null);
      setWalletTransactions(walletPageData.content);
      setTotalWalletTransactions(walletPageData.totalElements);
      const account = payoutAccountResponse?.result || null;
      setPayoutAccount(account);
      if (account) {
        setForm((previous) => ({
          ...previous,
          method: account.method || "BANK",
          bankName: account.bankName || "",
          accountName: account.accountName || "",
          accountNumber: account.accountNumber || "",
        }));
      }
    } catch (err) {
      console.error("Không thể tải dữ liệu rút tiền:", err);
      const message = formatWithdrawalText(err?.response?.data?.message);
      setError(message || "Không thể tải dữ liệu rút tiền");
      setWithdrawals([]);
      setWalletTransactions([]);
      setTotalWithdrawals(0);
      setTotalWalletTransactions(0);
      setWalletSummary(null);
      setPayoutAccount(null);
    } finally {
      setLoading(false);
    }
  }, [
    sellerId,
    debouncedWithdrawalKeyword,
    walletPage,
    walletPageSize,
    withdrawalPage,
    withdrawalPageSize,
    withdrawalStatusFilter,
  ]);

  useEffect(() => {
    void loadWithdrawals();
  }, [loadWithdrawals]);

  useEffect(() => {
    setWithdrawalPage(1);
  }, [debouncedWithdrawalKeyword, withdrawalPageSize, withdrawalStatusFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const Swal = await loadSwal();
    const amount = Number(form.amountVnd);
    if (!sellerId) {
      await Swal.fire("Chưa đăng nhập", "Vui lòng đăng nhập lại.", "warning");
      return;
    }
    if (!Number.isFinite(amount) || amount < 10000) {
      await Swal.fire("Số tiền chưa hợp lệ", "Số tiền rút tối thiểu là 10.000 VND.", "warning");
      return;
    }
    if (amount > availableBalance) {
      await Swal.fire("Số dư không đủ", "Số tiền rút vượt quá số dư khả dụng.", "warning");
      return;
    }
    if (!form.accountName.trim() || !form.accountNumber.trim()) {
      await Swal.fire("Thiếu thông tin nhận tiền", "Vui lòng nhập tên và số tài khoản nhận tiền.", "warning");
      return;
    }
    if (form.method === "BANK" && !form.bankName.trim()) {
      await Swal.fire("Thiếu ngân hàng", "Vui lòng nhập ngân hàng nhận tiền.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await SellerService.createWithdrawalRequest(sellerId, {
        amountVnd: amount,
        method: form.method,
        bankName: form.bankName.trim(),
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        note: form.note.trim(),
      });
      setForm({
        amountVnd: "",
        method: payoutAccount?.method || form.method || "BANK",
        bankName: payoutAccount?.bankName || form.bankName || "",
        accountName: payoutAccount?.accountName || form.accountName || "",
        accountNumber: payoutAccount?.accountNumber || form.accountNumber || "",
        note: "",
      });
      await Swal.fire("Đã gửi yêu cầu", "Bộ phận thanh toán sẽ xử lý chi trả và cập nhật trạng thái.", "success");
      await loadWithdrawals();
    } catch (err) {
      console.error("Không thể gửi yêu cầu rút tiền:", err);
      const message = formatWithdrawalText(err?.response?.data?.message);
      await Swal.fire(
        "Chưa thể gửi yêu cầu",
        message || "Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SellerLoadingState text="Đang tải dữ liệu rút tiền..." />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Rút tiền</h1>
        <button
          type="button"
          onClick={loadWithdrawals}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Suspense fallback={<WithdrawSectionFallback />}>
        <SellerWalletSummary
          attentionCount={attentionCount}
          availableBalance={availableBalance}
          grossWalletAmount={grossWalletAmount}
          inFlightAmount={inFlightAmount}
          onWalletPageChange={setWalletPage}
          onWalletPageSizeChange={(nextSize) => {
            setWalletPageSize(nextSize);
            setWalletPage(1);
          }}
          openRefundCount={openRefundCount}
          paidOutAmount={paidOutAmount}
          refundHoldAmount={refundHoldAmount}
          totalWalletTransactions={totalWalletTransactions}
          walletBalance={walletBalance}
          walletPage={walletPage}
          walletPageSize={walletPageSize}
          walletTransactions={walletTransactions}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
          <SellerWithdrawalForm
            form={form}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
          <SellerWithdrawalHistory
            onKeywordChange={setWithdrawalKeyword}
            onPageChange={setWithdrawalPage}
            onPageSizeChange={(nextSize) => {
              setWithdrawalPageSize(nextSize);
              setWithdrawalPage(1);
            }}
            onStatusFilterChange={setWithdrawalStatusFilter}
            totalWithdrawals={totalWithdrawals}
            withdrawalKeyword={withdrawalKeyword}
            withdrawalPage={withdrawalPage}
            withdrawalPageSize={withdrawalPageSize}
            withdrawalStatusFilter={withdrawalStatusFilter}
            withdrawals={withdrawals}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default WithdrawTab;
