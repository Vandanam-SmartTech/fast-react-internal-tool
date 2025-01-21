import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); // Clear JWT
    navigate("/login"); // Redirect to login
  };

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      console.log("Searching for:", searchQuery); // Replace with actual search logic
      setSearchQuery(""); // Clear input after search
    }
  };

  return (
    <nav className="bg-blue-100 text-blue-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between shadow-md">
      {/* Logo */}
      <div className="text-xl font-semibold mb-3 md:mb-0">Vandanam SmartTech</div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full md:mx-4">
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

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
