import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void; // Function to handle search
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      onSearch(searchQuery);
      setSearchQuery(""); // Clear input after search
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md w-full md:mx-4">
      <input
        type="search"
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full p-2 pl-10 text-sm border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search..."
        required
      />
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <button
        type="submit"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
