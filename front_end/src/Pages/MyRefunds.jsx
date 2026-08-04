import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiCreditCard,
  FiDownload,
} from "react-icons/fi";
import { getLearnerWallet, getMyRefundRequests, withdrawLearnerCreditDemo } from "../API/RefundService";
import AdminPagination from "../component/AdminPagination";
import ActionButton from "../shared/components/buttons/ActionButton";
import TableToolbar from "../shared/components/table/TableToolbar";
import { loadSwal } from "../shared/utils/alerts";
import { formatVnd as formatMoney } from "../shared/utils/formatters";
import { readStoredSession } from "../utils/session";

const PAGE_SIZE = 5;
const MyRefundCard = React.lazy(() => import("../features/refunds/MyRefundCard"));




const walletTypeLabel = {
  REFUND_CREDIT: "Tiền hoàn",
  PURCHASE_APPLIED: "Đã dùng mua khóa",
  WITHDRAWAL: "Đã rút tiền",
};






const MyRefunds = () => {
  const navigate = useNavigate();
  const session = readStoredSession();
  const [refunds, setRefunds] = useState([]);
  const [wallet, setWallet] = useState({ balanceVnd: 0, transactions: [] });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const loadRefunds = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const [refundResponse, walletResponse] = await Promise.all([
        getMyRefundRequests(session.token),
        getLearnerWallet(session.token),
      ]);
      setRefunds(Array.isArray(refundResponse.data?.result) ? refundResponse.data.result : []);
      setWallet({
        balanceVnd: Number(walletResponse.data?.result?.balanceVnd || 0),
        transactions: Array.isArray(walletResponse.data?.result?.transactions)
          ? walletResponse.data.result.transactions
          : [],
      });
    } catch (error) {
      const Swal = await loadSwal();
      await Swal.fire({
        icon: "error",
        title: "Không tải được danh sách hoàn tiền",
        text: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    const Swal = await loadSwal();
    if (!Number.isFinite(amount) || amount < 10000) {
      await Swal.fire("Số tiền chưa hợp lệ", "Số tiền rút tối thiểu là 10.000 đ.", "info");
      return;
    }
    if (amount > Number(wallet.balanceVnd || 0)) {
      await Swal.fire("Không đủ tín dụng", "Bạn chỉ có thể rút trong phạm vi số dư tín dụng hiện có.", "warning");
      return;
    }
    setWithdrawing(true);
    try {
      await withdrawLearnerCreditDemo(amount, session.token);
      setWithdrawAmount("");
      await loadRefunds();
      await Swal.fire("Đã rút tiền", "Giao dịch rút tiền đã được ghi nhận thành công.", "success");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Chưa rút được tiền",
        text: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  const filteredRefunds = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return [...refunds]
      .sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0))
      .filter((item) => {
        if (!keyword) return true;
        return [item.courseName, item.reason, item.adminNote, item.gatewayRefundMessage]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      });
  }, [refunds, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRefunds.length / PAGE_SIZE));
  const visibleRefunds = filteredRefunds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const learner = session?.currentUser || session?.user || {};
  const demoAccountNumber = learner?.id ? `9704${String(learner.id).padStart(8, "0")}` : "970400000000";
  const recentWalletTransactions = wallet.transactions.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <FiArrowLeft /> Quay lại
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                <FiShield /> Tín dụng & hoàn tiền
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">Tiền hoàn của tôi</h1>
              <p className="mt-2 text-sm text-slate-600">Theo dõi tiền hoàn, dùng để mua khóa khác hoặc rút tiền khi cần.</p>
            </div>
            <ActionButton onClick={loadRefunds} icon={<FiRefreshCw />} tone="slate">
              Làm mới
            </ActionButton>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <FiCreditCard /> Tín dụng học tập
                </span>
                <p className="mt-5 text-sm font-medium text-slate-500">Số tiền hoàn đang có</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{formatMoney(wallet.balanceVnd)}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Đây là tiền hoàn đã được admin duyệt. Bạn có thể dùng ở trang thanh toán hoặc rút về tài khoản mẫu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700"
              >
                Mua khóa học
              </button>
            </div>

            {recentWalletTransactions.length > 0 && (
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-800">Giao dịch gần đây</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {recentWalletTransactions.map((transaction) => {
                    const incoming = transaction.type === "REFUND_CREDIT";
                    return (
                      <div key={transaction.id} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-700">{walletTypeLabel[transaction.type] || transaction.type}</span>
                          <span className={`font-bold ${incoming ? "text-emerald-700" : "text-slate-700"}`}>
                            {incoming ? "+" : "-"}{formatMoney(transaction.amountVnd)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{transaction.description || transaction.reference}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-blue-950">
                <FiDownload /> Rút tiền
            </div>
            <p className="mt-2 text-sm text-blue-800">
              Hệ thống tự ghi nhận thành công nếu số dư đủ.
            </p>
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{learner?.fullname || learner?.username || "Học viên"}</div>
              <div>MB Bank</div>
              <div>{demoAccountNumber}</div>
            </div>
            <label className="mt-4 block text-sm font-semibold text-blue-950">Số tiền muốn rút</label>
            <input
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              inputMode="numeric"
              placeholder="Nhập số tiền"
              className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawing || Number(wallet.balanceVnd || 0) <= 0}
              className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {withdrawing ? "Đang rút..." : "Rút tiền"}
            </button>
          </div>
        </section>

        <div className="mt-6">
          <TableToolbar
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo khóa học, lý do hoặc phản hồi..."
            searchValue={searchTerm}
          />
        </div>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Đang tải danh sách hoàn tiền...</div>
          ) : visibleRefunds.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <FiClock className="mx-auto mb-4 text-3xl text-slate-400" />
              <h2 className="text-xl font-bold">Chưa có yêu cầu hoàn tiền</h2>
              <p className="mt-2 text-sm text-slate-500">Khi bạn gửi yêu cầu từ trang khóa học, nội dung sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <React.Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Đang tải danh sách hoàn tiền...</div>}>
              {visibleRefunds.map((item) => (
                <MyRefundCard
                  key={item.id}
                  item={item}
                  onViewCourse={(courseId) => navigate(`/detail/${courseId}`)}
                />
              ))}
            </React.Suspense>
          )}
        </section>

        {!loading && filteredRefunds.length > 0 && (
          <AdminPagination
            className="mt-6 border-t-0 px-0"
            currentPage={page}
            itemLabel="yêu cầu"
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredRefunds.length}
          />
        )}
      </main>
    </div>
  );
};

export default MyRefunds;


