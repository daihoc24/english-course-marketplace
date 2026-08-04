import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchBar = ({ 
  onSearch, 
  onAdvancedSearch: _onAdvancedSearch, 
  onClearSearch, 
  placeholder = "Tìm khóa học...",
  showFilters = false,
  onToggleFilters,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        onSearch(searchTerm.trim());
      } else {
        setIsSearching(false);
        onClearSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch, onClearSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setIsSearching(false);
    onClearSearch();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Clear button */}
        {searchTerm && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters toggle button */}
      {onToggleFilters && (
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
            showFilters 
              ? 'border-blue-500 bg-blue-50 text-blue-600' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <FiFilter className="w-4 h-4" />
          Bộ lọc
        </button>
      )}

      {/* Search status indicator */}
      {isSearching && searchTerm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
        >
          <FiSearch className="w-3 h-3" />
          <span>Đang tìm...</span>
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;
