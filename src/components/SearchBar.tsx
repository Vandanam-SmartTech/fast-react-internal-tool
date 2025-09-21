import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showClearButton?: boolean;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  className = '',
  showClearButton = true,
  initialValue = ''
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-500 dark:text-secondary-400 group-focus-within:text-primary-500 transition-colors duration-200" />
      
      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="w-full pl-10 pr-12 py-3 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
      />
      
      {showClearButton && query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors duration-200"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      

      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus-within:ring-primary-500/20 transition-all duration-200 pointer-events-none" />
    </div>
  );
};

export default SearchBar;