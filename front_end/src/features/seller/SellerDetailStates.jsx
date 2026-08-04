export function SellerDetailLoadingState() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="font-medium text-slate-600">Đang tải hồ sơ người bán...</p>
      </div>
    </main>
  );
}

export function SellerDetailErrorState({ error, onBack }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-bold text-red-600">Không thể tải hồ sơ</p>
        <p className="mt-2 text-slate-600">{error || "Không tìm thấy người bán."}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          Quay lại
        </button>
      </div>
    </main>
  );
}

export function SellerCoursesFallback() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      Đang tải khóa học...
    </div>
  );
}
