export function CourseVideoLoadingState({ courseId }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="text-gray-600">Đang tải khóa học {courseId}...</p>
      </div>
    </div>
  );
}

export function CourseVideoErrorState({ courseId, error, onBack, onLogin, onRetry }) {
  const needsLogin = String(error || "").toLowerCase().includes("login");

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-2 text-lg font-semibold text-red-600">Không tải được khóa học</div>
        <p className="text-gray-600">{error}</p>
        <p className="mt-2 text-sm text-gray-500">Mã khóa học: {courseId}</p>
        <div className="mt-4 space-x-2">
          {needsLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Đăng nhập
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Thử lại
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    </div>
  );
}

export function CourseVideoEmptyState({ courseId }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center text-gray-600">
        <p className="text-lg">Chưa có nội dung khóa học</p>
        <p className="text-sm">Mã khóa học: {courseId}</p>
      </div>
    </div>
  );
}

export function CourseVideoFallback({ trial = false }) {
  return (
    <div className={`flex h-screen items-center justify-center text-sm text-slate-500 ${trial ? "bg-white" : "bg-slate-100"}`}>
      {trial ? "Đang tải màn xem thử..." : "Đang tải màn học..."}
    </div>
  );
}
