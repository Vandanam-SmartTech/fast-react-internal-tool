import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Clear JWT
    navigate('/login'); // Redirect to login
  };

  return (
    <nav
      style={{ backgroundColor: '#e3f2fd' }}
      className="text-blue-800 px-4 py-3 flex items-center justify-between shadow-md"
    >
      {/* Logo or Brand Name */}
      <div className="text-xl font-semibold">
        Vandanam SmartTech
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
