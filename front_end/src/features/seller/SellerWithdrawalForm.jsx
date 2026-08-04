export default function SellerWithdrawalForm({
  form = {},
  onChange,
  onSubmit,
  submitting = false,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Số tiền rút</label>
        <input
          name="amountVnd"
          type="number"
          min="10000"
          step="1000"
          value={form.amountVnd}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Nhập số tiền"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phương thức rút tiền</label>
        <select
          name="method"
          value={form.method}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="BANK">Ngân hàng</option>
          <option value="PAYPAL">PayPal</option>
        </select>
      </div>
      {form.method === "BANK" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
          <input
            name="bankName"
            value={form.bankName}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="VD: Vietcombank"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên chủ tài khoản</label>
        <input
          name="accountName"
          value={form.accountName}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Nhập tên người nhận"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Số tài khoản hoặc email PayPal</label>
        <input
          name="accountNumber"
          value={form.accountNumber}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Nhập thông tin nhận tiền"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
        <textarea
          name="note"
          value={form.note}
          onChange={onChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Ghi chú cho admin"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {submitting ? "Đang gửi..." : "Yêu cầu rút tiền"}
      </button>
    </form>
  );
}
