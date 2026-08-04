import { FiBell } from "react-icons/fi";

export default function NotificationAuthGate({ onLogin }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <FiBell className="mx-auto mb-4 text-3xl text-blue-600" />
      <h1 className="text-2xl font-bold">Đăng nhập để xem thông báo</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
        Theo dõi phản hồi về khiếu nại, hoàn tiền, đơn hàng và các cập nhật quan trọng khác tại một nơi.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Đăng nhập
      </button>
    </section>
  );
}
