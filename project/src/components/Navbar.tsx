import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar"; // Import the SearchBar component

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); // Clear JWT
    navigate("/login"); // Redirect to login
  };

  // Function to handle search (pass to SearchBar)
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Here you can call an API or navigate to a results page
  };

  // Show search bar only on listOfConsumers page
  const isSearchVisible = location.pathname === "/list-of-consumers";

  // Navigate to List of Consumers page
  const goToListOfConsumers = () => {
    navigate("/list-of-consumers");
  };

  // const goToModifyConsumerForm = () =>{
  //   navigate("/modify-consumer-form");
  // }

  return (
    <nav className="bg-blue-100 text-blue-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between shadow-md">
      {/* Logo */}
      <div className="text-xl font-semibold mb-3 md:mb-0">Vandanam SmartTech</div>

      {/* Search Bar (only visible on listOfConsumers page) */}
      {isSearchVisible && <SearchBar onSearch={handleSearch} />}

      {/* Buttons */}
      <div className="flex items-center space-x-4">
        {/* List of Consumers Button */}
        <button
          onClick={goToListOfConsumers}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          List of Consumers
        </button>


        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
