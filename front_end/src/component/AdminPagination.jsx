import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

function pageWindow(currentPage, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount]);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  return [...pages].sort((a, b) => a - b).reduce((items, page, index, sortedPages) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      items.push(`ellipsis-${page}`);
    }
    items.push(page);
    return items;
  }, []);
}

export default function AdminPagination({
  className = "",
  currentPage,
  itemLabel = "mục",
  onPageChange,
  onPageSizeChange,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalItems,
}) {
  if (!totalItems) return null;

  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), pageCount);
  const firstItem = (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(totalItems, safePage * pageSize);
  const visiblePages = pageWindow(safePage, pageCount);

  const changePage = (nextPage) => {
    onPageChange(Math.min(Math.max(nextPage, 1), pageCount));
  };

  return (
    <div className={`flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        Hiển thị {firstItem.toLocaleString("vi-VN")}-{lastItem.toLocaleString("vi-VN")} / {totalItems.toLocaleString("vi-VN")} {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            aria-label={`Số ${itemLabel} mỗi trang`}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / trang
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => changePage(safePage - 1)}
          disabled={safePage === 1}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Trang trước"
        >
          <FiChevronLeft />
          Trước
        </button>

        {visiblePages.map((page) => (
          typeof page === "number" ? (
            <button
              key={page}
              type="button"
              onClick={() => changePage(page)}
              aria-current={page === safePage ? "page" : undefined}
              className={`min-w-10 rounded-lg border px-3 py-2 font-semibold transition ${
                page === safePage
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={page} className="px-1 text-slate-400" aria-hidden="true">
              ...
            </span>
          )
        ))}

        <button
          type="button"
          onClick={() => changePage(safePage + 1)}
          disabled={safePage === pageCount}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Trang sau"
        >
          Sau
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
