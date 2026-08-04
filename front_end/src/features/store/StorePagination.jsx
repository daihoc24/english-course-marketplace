import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getStorePageNumbers } from "./storeView";

export default function StorePagination({ currentPage, onPageChange, totalPages }) {
  if (totalPages <= 0) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2" data-testid="store-pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`flex items-center gap-1 rounded-lg border px-3 py-2 transition ${
          currentPage === 0
            ? "cursor-not-allowed border-gray-700 text-gray-600"
            : "border-gray-600 text-white hover:bg-gray-700"
        }`}
        data-testid="store-pagination-prev"
        type="button"
      >
        <FiChevronLeft className="h-4 w-4" />
        Trước
      </button>

      {getStorePageNumbers(currentPage, totalPages).map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`rounded-lg border px-3 py-2 transition ${
            pageNumber === currentPage
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-600 text-white hover:bg-gray-700"
          }`}
          data-testid={`store-pagination-page-${pageNumber}`}
          type="button"
        >
          {pageNumber + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={`flex items-center gap-1 rounded-lg border px-3 py-2 transition ${
          currentPage >= totalPages - 1
            ? "cursor-not-allowed border-gray-700 text-gray-600"
            : "border-gray-600 text-white hover:bg-gray-700"
        }`}
        data-testid="store-pagination-next"
        type="button"
      >
        Sau
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
