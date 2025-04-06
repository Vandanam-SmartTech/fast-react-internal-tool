import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Using X for close icon
import Logo from "../assets/Vandanam_SmartTech_Logo.png"; // Adjust path if needed
import { Home, UserPlus, Users, UserRoundCheck, UserCog, LogOut } from "lucide-react";
import { fetchClaims } from "../services/api";


const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarOpen", newState.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem("selectedRepresentative");
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  useEffect(() => {
    const storedState = localStorage.getItem("sidebarOpen");
    setIsOpen(storedState === "true"); // If not present, will default to false
  }, []);

  const goToListOfConsumers = () => {
    navigate("/list-of-consumers");
  };

  const goToOnboardedCustomers = () => {
    navigate("/OnboardedCustomers");
  };

  const goToCustomerForm = () => {
    navigate("/CustomerForm");
  };

  const handleHomeClick = () => {
    if (roles.includes('ROLE_REPRESENTATIVE')) {
      navigate('/RepresentativeDashboard');
    } else if (roles.includes('ROLE_ADMIN')) {
      navigate('/AdminDashboard');
    } else {
      alert('Unauthorized role.'); // or handle error state
    }
  };
  

  useEffect(() => {
    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setRoles(claims.roles || []);
      } catch (error) {
        console.error("Failed to fetch user claims", error);
      }
    };

    getClaims();
  }, []);

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

          <button
  onClick={handleHomeClick}
  className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
    location.pathname === "/AdminDashboard" || location.pathname === "/RepresentativeDashboard"
      ? "text-blue-600 font-semibold"
      : "text-black"
  }`}
>
  <Home size={18} />
  Home
</button>



  <button onClick={goToCustomerForm}
  className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
    location.pathname === "/CustomerForm"
      ? "text-blue-600 font-semibold"
      : "text-black"
  }`}>
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

  {roles.includes("ROLE_ADMIN") && (
              <button className="flex items-center gap-2 px-2 py-1 text-black whitespace-nowrap">
                <UserCog className="h-7 w-7" />
                Manage Representatives
              </button>
            )}

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
