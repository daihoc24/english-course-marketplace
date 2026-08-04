export const STORE_PAGE_SIZE = 12;

export const storeSortOptions = [
  { label: "Mới nhất", sortBy: "createdDate", sortDirection: "desc" },
  { label: "Giá thấp đến cao", sortBy: "price", sortDirection: "asc" },
  { label: "Giá cao đến thấp", sortBy: "price", sortDirection: "desc" },
  { label: "Đánh giá cao nhất", sortBy: "averageRating", sortDirection: "desc" },
];

export const storePriceRanges = [
  { label: "Dưới 200.000đ", minPrice: 0, maxPrice: 199999 },
  { label: "200.000đ - 500.000đ", minPrice: 200000, maxPrice: 500000 },
  { label: "500.000đ - 1.000.000đ", minPrice: 500000, maxPrice: 1000000 },
  { label: "1.000.000đ - 2.000.000đ", minPrice: 1000000, maxPrice: 2000000 },
  { label: "Trên 2.000.000đ", minPrice: 2000001, maxPrice: null },
];

export const storeRatingOptions = [3.0, 3.5, 4.0, 4.5];

export const getStorePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  let start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages - 1, start + 4);

  if (end - start < 4) {
    start = Math.max(0, end - 4);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const buildStoreSearchParams = ({
  keyword,
  selectedCategoryId,
  selectedPriceRange,
  selectedRating,
  selectedSort,
  page = 0,
}) => {
  const sort = storeSortOptions[selectedSort] || storeSortOptions[0];
  const priceRange = selectedPriceRange !== null ? storePriceRanges[selectedPriceRange] : null;

  return {
    keyword,
    categoryId: selectedCategoryId,
    minPrice: priceRange ? priceRange.minPrice : null,
    maxPrice: priceRange ? priceRange.maxPrice : null,
    minRating: selectedRating,
    sortBy: sort.sortBy,
    sortDirection: sort.sortDirection,
    page,
    size: STORE_PAGE_SIZE,
  };
};
