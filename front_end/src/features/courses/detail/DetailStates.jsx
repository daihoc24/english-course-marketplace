export function DetailSectionFallback({ label }) {
  return (
    <div className="py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        {label}
      </div>
    </div>
  );
}

export function DetailLoadingState() {
  return (
    <div className="mx-auto max-w-6xl bg-white px-4">
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    </div>
  );
}

export function DetailErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto max-w-6xl bg-white px-4">
      <div className="py-20 text-center">
        <div className="mb-2 text-lg font-semibold text-red-600">Không tải được khóa học</div>
        <p className="text-gray-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
