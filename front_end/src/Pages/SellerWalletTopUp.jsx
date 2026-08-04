import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, CheckCircle2, Copy, QrCode, WalletCards } from "lucide-react";
import SellerService from "../API/SellerService";
import { ProductContext } from "../context/ProductContext";
import { loadSwal } from "../shared/utils/alerts";
import { getActiveSession } from "../utils/session";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const presetAmounts = [100000, 300000, 500000, 1000000];

function FakeQr() {
  const blocks = [
    0, 1, 2, 4, 5, 6, 9, 12, 13, 14, 16, 18, 20, 21, 24, 26, 27, 28,
    32, 33, 35, 38, 40, 42, 45, 46, 48, 49, 51, 54, 56, 58, 60, 61,
    64, 66, 67, 69, 72, 74, 75, 76, 80, 81, 84, 86, 88, 89, 90, 92,
  ];

  return (
    <div className="mx-auto grid h-52 w-52 grid-cols-10 gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {Array.from({ length: 100 }, (_, index) => (
        <span
          key={index}
          className={`rounded-[2px] ${blocks.includes(index) ? "bg-slate-950" : "bg-slate-100"}`}
        />
      ))}
    </div>
  );
}

export default function SellerWalletTopUp() {
  const navigate = useNavigate();
  const { session } = useContext(ProductContext);
  const activeSession = getActiveSession(session);
  const sellerId = activeSession?.currentUser?.id || activeSession?.user?.id;
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const transferContent = useMemo(
    () => `NAP VI SELLER ${sellerId || "DEMO"}`,
    [sellerId]
  );
  const demoAccountNumber = useMemo(
    () => `9704${String(sellerId || 0).padStart(8, "0")}`,
    [sellerId]
  );

  const copyText = async (text) => {
    const Swal = await loadSwal();
    try {
      await navigator.clipboard.writeText(text);
      await Swal.fire({
        icon: "success",
        title: "Đã sao chép",
        timer: 900,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire("Không thể sao chép", "Bạn có thể bôi đen và sao chép thủ công.", "info");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const Swal = await loadSwal();
    const amountVnd = Number(amount);
    if (!sellerId) {
      await Swal.fire("Chưa đăng nhập", "Vui lòng đăng nhập lại bằng tài khoản người bán.", "warning");
      return;
    }
    if (!Number.isFinite(amountVnd) || amountVnd < 10000) {
      await Swal.fire("Số tiền chưa hợp lệ", "Số tiền nạp tối thiểu là 10.000 đ.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await SellerService.topUpWalletDemo(sellerId, {
        amountVnd,
        note: `Nạp ví người bán - ${transferContent}`,
      });
      await Swal.fire({
        icon: "success",
        title: "Đã nạp tiền vào ví",
        text: "Giao dịch đã được ghi nhận. Số dư ví người bán đã được cập nhật.",
        confirmButtonText: "Về ví người bán",
        confirmButtonColor: "#2563eb",
      });
      navigate("/seller/dashboard?tab=withdraw", { replace: true });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Chưa nạp được tiền",
        text: error?.response?.data?.message || "Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/seller/dashboard?tab=withdraw")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} /> Về ví người bán
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                <WalletCards size={14} /> Ví người bán
              </span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight">Nạp tiền vào ví</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Đây là bước ghi nhận nạp ví trong hệ thống. Bạn nhập số tiền, kiểm tra thông tin chuyển khoản, rồi bấm xác nhận để cộng tiền vào ví người bán.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Số tiền muốn nạp</label>
                  <div className="mt-2 flex rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                    <input
                      type="number"
                      min="10000"
                      step="1000"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Nhập số tiền"
                      className="min-w-0 flex-1 rounded-2xl border-0 px-4 py-4 text-lg font-bold outline-none"
                    />
                    <span className="flex items-center px-4 text-sm font-bold text-slate-400">VND</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {presetAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(String(value))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {formatMoney(value)}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                    <p>
                      Tiền nạp vào ví vẫn là tiền của người bán. Bạn có thể rút phần còn lại sau khi hệ thống trừ các khoản đang giữ cho hoàn tiền hoặc khiếu nại.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <Banknote size={18} /> {submitting ? "Đang ghi nhận..." : "Tôi đã chuyển khoản"}
                </button>
              </form>
            </div>

            <aside className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">QR chuyển khoản ảo</p>
                    <p className="mt-1 text-xs text-slate-500">Dùng để minh họa flow nạp tiền</p>
                  </div>
                  <QrCode className="text-blue-600" />
                </div>

                <FakeQr />

                <div className="mt-6 space-y-3 text-sm">
                  <InfoRow label="Ngân hàng" value="MB Bank" />
                  <InfoRow label="Tên tài khoản" value="COURSE MARKETPLACE" />
                  <InfoRow label="Số tài khoản" value={demoAccountNumber} onCopy={() => copyText(demoAccountNumber)} />
                  <InfoRow label="Nội dung" value={transferContent} onCopy={() => copyText(transferContent)} />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoRow({ label, value, onCopy }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="break-all text-sm font-bold text-slate-900">{value}</p>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
            aria-label={`Sao chép ${label}`}
          >
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
