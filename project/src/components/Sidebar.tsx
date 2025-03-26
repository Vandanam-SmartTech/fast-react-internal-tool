import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Using X for close icon
import Logo from "../assets/Vandanam_SmartTech_Logo.png"; // Adjust path if needed
import { UserPlus, Users, UserRoundCheck, UserCog, LogOut } from "lucide-react";


const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const goToListOfConsumers = () => {
    navigate("/list-of-consumers");
  };

  const goToOnboardedCustomers = () => {
    navigate("/OnboardedCustomers");
  };

  return (
    <>
      {/* Toggle button for smaller screens */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-3 left-2 z-50 p-2  text-blue-800 rounded-md"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-blue-100 text-blue-800 shadow-md z-40 transition-transform duration-300 ease-in-out`}
        >
          {/* Close Icon */}
          <div className="relative px-4 pt-6 pb-2 border-b border-blue-200">
  {/* Logo */}
  <img src={Logo} alt="Logo" className="h-20 w-auto ml-8" />

  {/* Cross Button */}
  <button
    onClick={toggleSidebar}
    className="absolute top-3 right-2 text-blue-800 hover:text-red-500"
  >
    <X size={24} />
  </button>
</div>


          {/* Navigation Buttons */}
          <div className="flex flex-col space-y-3 px-6 py-6">
  <button className="flex items-center gap-2 px-2 py-1 text-black whitespace-nowrap">
    <UserPlus size={18} />
    Add New Customer
  </button>

  <button
  onClick={goToListOfConsumers}
  className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
    location.pathname === "/list-of-consumers"
      ? "text-blue-600 font-semibold"
      : "text-black"
  }`}
>
  <Users size={18} />
  List of Customers
</button>

  <button
    onClick={goToOnboardedCustomers}
    className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
      location.pathname === "/OnboardedCustomers"
        ? "text-blue-600 font-semibold"
        : "text-black"
    }`}
  >
    <UserRoundCheck size={18} />
    Onboarded Customers
  </button>

  <button className="flex items-center gap-2 px-2 py-1 text-black whitespace-nowrap">
    <UserCog className="h-7 w-7" />
    Manage Representatives
  </button>

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 px-2 py-1 text-black whitespace-nowrap"
  >
    <LogOut size={18} />
    Logout
  </button>
</div>





        </div>
        
      )}
    </>
  );
};

export default Sidebar;
