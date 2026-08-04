import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import ProductCard from "../component/ProductCard";
import StoreFilterPanel from "../features/store/StoreFilterPanel";
import StorePagination from "../features/store/StorePagination";
import {
  StoreEmptyState,
  StoreErrorState,
  StoreLoadingState,
} from "../features/store/StoreStateBlock";
import {
  buildStoreSearchParams,
  STORE_PAGE_SIZE,
  storeSortOptions,
} from "../features/store/storeView";
import { getCategories } from "../services/CourseService";

const Store = () => {
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    fetchCourses,
  } = useProduct();

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const debounceTimerRef = useRef(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCategories();
        if (response.code === 200 && Array.isArray(response.result)) {
          setCategories(response.result);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const buildSearchParams = useCallback(
    (overrides = {}) => {
      return buildStoreSearchParams({
        keyword: overrides.keyword !== undefined ? overrides.keyword : searchTerm,
        selectedCategoryId: overrides.categoryId !== undefined ? overrides.categoryId : selectedCategoryId,
        selectedPriceRange: overrides.priceRange !== undefined ? overrides.priceRange : selectedPriceRange,
        selectedRating: overrides.rating !== undefined ? overrides.rating : selectedRating,
        selectedSort: overrides.sortIndex ?? selectedSort,
        page: overrides.page !== undefined ? overrides.page : 0,
      });
    },
    [searchTerm, selectedSort, selectedCategoryId, selectedPriceRange, selectedRating]
  );

  const triggerFetch = useCallback(
    (overrides = {}) => {
      const params = buildSearchParams(overrides);
      fetchCourses(params);
    },
    [buildSearchParams, fetchCourses]
  );

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const q = searchParams.get("q") || "";
    if (q) {
      setSearchTerm(q);
      triggerFetch({ keyword: q });
    } else {
      triggerFetch({ keyword: "" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialLoadDone.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerFetch({ keyword: searchTerm, page: 0 });
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedSort(idx);
    triggerFetch({ sortIndex: idx, page: 0 });
  };

  const handleCategoryChange = (catId) => {
    const newCatId = selectedCategoryId === catId ? null : catId;
    setSelectedCategoryId(newCatId);
    triggerFetch({ categoryId: newCatId, page: 0 });
  };

  const handlePriceRangeChange = (idx) => {
    const newIdx = selectedPriceRange === idx ? null : idx;
    setSelectedPriceRange(newIdx);
    triggerFetch({ priceRange: newIdx, page: 0 });
  };

  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    triggerFetch({ rating: newRating, page: 0 });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId(null);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSelectedSort(0);
    fetchCourses({
      keyword: "",
      categoryId: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      sortBy: "createdDate",
      sortDirection: "desc",
      page: 0,
      size: STORE_PAGE_SIZE,
    });
  };

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    triggerFetch({ page });
  };

  const handleRetry = () => {
    triggerFetch({});
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.slice(0, 100);
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Khóa học tiếng Anh</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm khóa học..."
                value={searchTerm}
                onChange={handleSearchChange}
                maxLength={100}
                data-testid="store-search-input"
                className="w-64 px-4 py-2 rounded-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={selectedSort}
              onChange={handleSortChange}
              data-testid="store-sort-dropdown"
              className="px-4 py-2 rounded-full border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {storeSortOptions.map((option, idx) => (
                <option key={idx} value={idx}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              data-testid="store-filter-toggle"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
            >
              <FiFilter />
              Bộ lọc
            </button>
          </div>
        </div>

        {!loading && !error && (
          <div className="mb-4">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium" data-testid="store-total-count">
              Tìm thấy {totalElements} khóa học
            </span>
          </div>
        )}

        {showFilters && (
          <StoreFilterPanel
            categories={categories}
            categoriesLoading={categoriesLoading}
            onCategoryChange={handleCategoryChange}
            onClearFilters={handleClearFilters}
            onPriceRangeChange={handlePriceRangeChange}
            onRatingChange={handleRatingChange}
            selectedCategoryId={selectedCategoryId}
            selectedPriceRange={selectedPriceRange}
            selectedRating={selectedRating}
          />
        )}

        {loading && <StoreLoadingState />}

        {!loading && error && (
          <StoreErrorState error={error} onRetry={handleRetry} />
        )}

        {!loading && !error && products.length === 0 && (
          <StoreEmptyState onClearFilters={handleClearFilters} />
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="store-course-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <StorePagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Store;
