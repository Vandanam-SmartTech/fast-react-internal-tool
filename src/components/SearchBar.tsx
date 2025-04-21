import React, { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search...", onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="w-full max-w-sm min-w-[200px] mb-4">
      <div className="relative">
        <input
          className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;