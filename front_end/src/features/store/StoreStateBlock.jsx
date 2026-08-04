import { FiSearch } from "react-icons/fi";

export const StoreLoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
    <span className="ml-3 text-gray-300">Đang tải khóa học...</span>
  </div>
);

export const StoreErrorState = ({ error, onRetry }) => (
  <div
    className="rounded-lg border border-gray-700 bg-gray-800/50 py-12 text-center shadow"
    data-testid="store-error-state"
  >
    <div className="mb-4 text-5xl text-red-400">!</div>
    <h3 className="mb-2 text-xl font-semibold text-white">Không tải được khóa học</h3>
    <p className="mb-4 text-gray-400">{error}</p>
    <button
      onClick={onRetry}
      data-testid="store-retry-button"
      className="rounded-full bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
      type="button"
    >
      Thử lại
    </button>
  </div>
);

export const StoreEmptyState = ({ onClearFilters }) => (
  <div
    className="rounded-lg border border-gray-700 bg-gray-800/50 py-12 text-center shadow"
    data-testid="store-empty-state"
  >
    <FiSearch className="mx-auto mb-4 h-16 w-16 text-gray-400" />
    <h3 className="mb-2 text-xl font-semibold text-white">Không tìm thấy khóa học</h3>
    <p className="mb-4 text-gray-400">Hãy thử đổi từ khóa tìm kiếm hoặc bộ lọc</p>
    <button
      onClick={onClearFilters}
      className="rounded-full bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
      type="button"
    >
      Xóa bộ lọc
    </button>
  </div>
);
