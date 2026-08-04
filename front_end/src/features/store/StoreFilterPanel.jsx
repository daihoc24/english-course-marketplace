import { FiX } from "react-icons/fi";
import { storePriceRanges, storeRatingOptions } from "./storeView";

export default function StoreFilterPanel({
  categories,
  categoriesLoading,
  onCategoryChange,
  onClearFilters,
  onPriceRangeChange,
  onRatingChange,
  selectedCategoryId,
  selectedPriceRange,
  selectedRating,
}) {
  return (
    <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow" data-testid="store-filter-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Bộ lọc</h3>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
          data-testid="store-clear-filters"
          type="button"
        >
          <FiX className="h-4 w-4" />
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <h4 className="mb-3 font-medium text-white">Danh mục</h4>
          <div className="space-y-2">
            {categoriesLoading ? (
              <span className="text-sm text-gray-400">Đang tải danh mục...</span>
            ) : (
              categories.map((category) => (
                <label key={category.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategoryId === category.id}
                    onChange={() => onCategoryChange(category.id)}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">{category.name}</span>
                </label>
              ))
            )}
            {selectedCategoryId !== null && (
              <button
                onClick={() => onCategoryChange(selectedCategoryId)}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                type="button"
              >
                Xóa danh mục
              </button>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-white">Khoảng giá</h4>
          <div className="space-y-2">
            {storePriceRanges.map((range, index) => (
              <label key={range.label} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="priceRange"
                  checked={selectedPriceRange === index}
                  onChange={() => onPriceRangeChange(index)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">{range.label}</span>
              </label>
            ))}
            {selectedPriceRange !== null && (
              <button
                onClick={() => onPriceRangeChange(selectedPriceRange)}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                type="button"
              >
                Xóa giá
              </button>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-white">Đánh giá tối thiểu</h4>
          <div className="space-y-2">
            {storeRatingOptions.map((rating) => (
              <label key={rating} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => onRatingChange(rating)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Từ {rating} sao</span>
              </label>
            ))}
            {selectedRating !== null && (
              <button
                onClick={() => onRatingChange(selectedRating)}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                type="button"
              >
                Xóa lọc đánh giá
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
