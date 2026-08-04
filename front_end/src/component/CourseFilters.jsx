import React from 'react';
import { FiX, FiBook, FiUsers, FiClock, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CourseFilters = ({
  show,
  onClose,
  selectedCategories,
  selectedPrices,
  selectedRatings,
  onToggleCategory,
  onTogglePrice,
  onToggleRating,
  onClearAll,
  categories = [],
  priceRanges = [],
  ratingOptions = []
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filter Courses</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <FiX className="w-4 h-4" />
            Clear all
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FiBook className="w-4 h-4 text-blue-600" />
            Course Categories
          </h4>
          <div className="space-y-3">
            {categories.map(category => (
              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => onToggleCategory(category)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Ranges */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FiDollarSign className="w-4 h-4 text-green-600" />
            Price Range
          </h4>
          <div className="space-y-3">
            {priceRanges.map(range => (
              <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(range.value)}
                  onChange={() => onTogglePrice(range.value)}
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-yellow-500">★</span>
            Minimum Rating
          </h4>
          <div className="space-y-3">
            {ratingOptions.map(rating => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(rating)}
                  onChange={() => onToggleRating(rating)}
                  className="w-4 h-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1">
                  {rating}
                  <span className="text-yellow-500">★</span>
                  & Up
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {(selectedCategories.length > 0 || selectedPrices.length > 0 || selectedRatings.length > 0) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Active Filters:</h5>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(category => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {category}
                <button
                  onClick={() => onToggleCategory(category)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedPrices.map(price => {
              const range = priceRanges.find(r => r.value === price);
              return (
                <span
                  key={price}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {range?.label}
                  <button
                    onClick={() => onTogglePrice(price)}
                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedRatings.map(rating => (
              <span
                key={rating}
                className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
              >
                {rating}★+
                <button
                  onClick={() => onToggleRating(rating)}
                  className="hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CourseFilters;