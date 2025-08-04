import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Using X for close icon
import Logo from "../assets/Vandanam_SmartTech_Logo.png"; 
import { Home, UserPlus, Users, UserRoundCheck, LogOut, UserCog, UsersRound, Building, Shield, UserCheck, LayoutDashboard, Building2, Briefcase, ChevronDown, ChevronRight } from "lucide-react";
import { fetchClaims } from "../services/jwtService";


const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [customersExpanded, setCustomersExpanded] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
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
    setIsOpen(storedState === "true");
    
    const customersState = localStorage.getItem("customersExpanded");
    setCustomersExpanded(customersState === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("customersExpanded", customersExpanded.toString());
  }, [customersExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        localStorage.setItem("sidebarOpen", "false");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  const goToListOfConsumers = () => {
    navigate("/list-of-consumers");
  };

  const goToOnboardedConsumers = () => {
    navigate("/OnboardedConsumers");
  };

  const goToCustomerForm = () => {
    navigate("/CustomerForm");
  };

  const goToUserForm = () => {
    navigate("/UserForm");
  };

  const goToListOfUsers = () => {
    navigate("/list-of-users");
  };

  const goToOrganizations = () => {
    navigate("/organizations");
  };

  const goToAdminManagement = () => {
    navigate("/admin-management");
  };

  const goToUserManagement = () => {
    navigate("/user-management");
  };



  const handleHomeClick = async () => {
    try {
      const claims = await fetchClaims();
      
      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        navigate('/SuperAdminDashboard');
        return;
      }
      
      const selectedOrgId = localStorage.getItem('selectedOrganization');
      if (!selectedOrgId || !claims.org_roles) {
        alert('No organization selected.');
        return;
      }
      
      const orgData = claims.org_roles[selectedOrgId];
      if (!orgData) {
        alert('Invalid organization selection.');
        return;
      }
      
      switch (orgData.role) {
        case 'ROLE_ORG_ADMIN':
          navigate('/AdminDashboard');
          break;
        case 'ROLE_AGENCY_ADMIN':
          navigate('/AgencyAdminDashboard');
          break;
        case 'ROLE_STAFF':
          navigate('/StaffDashboard');
          break;
        case 'ROLE_REPRESENTATIVE':
          navigate('/RepresentativeDashboard');
          break;
        default:
          alert('Unauthorized role.');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      alert('Error determining user role.');
    }
  };
  

  useEffect(() => {
    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        const allRoles = [];
        if (claims.global_roles) {
          allRoles.push(...claims.global_roles);
        }
        if (claims.org_roles) {
          const selectedOrgId = localStorage.getItem('selectedOrganization');
          if (selectedOrgId && claims.org_roles[selectedOrgId]) {
            allRoles.push(claims.org_roles[selectedOrgId].role);
          }
        }
        setRoles(allRoles);
      } catch (error) {
        console.error("Failed to fetch user claims", error);
      }
    };

    getClaims();
    
    const handleOrgChange = () => {
      getClaims();
    };
    
    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
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
        ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-64 bg-blue-100 text-blue-800 shadow-md z-20 transition-transform duration-300 ease-in-out`}
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
    location.pathname === "/AdminDashboard" || location.pathname === "/RepresentativeDashboard" || location.pathname === "/SuperAdminDashboard" || location.pathname === "/AgencyAdminDashboard" || location.pathname === "/StaffDashboard"
      ? "text-blue-600 font-semibold"
      : "text-black"
  }`}
>
  <LayoutDashboard size={18} />
  Dashboard
</button>

{/* Manage Customers Section */}
<div>
  <button
    onClick={() => {
      setCustomersExpanded(!customersExpanded);
    }}
    className={`flex items-center justify-between w-full gap-2 px-2 py-1 whitespace-nowrap ${
      ['/manage-customers', '/CustomerForm', '/list-of-consumers', '/OnboardedConsumers'].includes(location.pathname)
        ? "text-blue-600 font-semibold"
        : "text-black"
    }`}
  >
    <div className="flex items-center gap-2">
      <Users size={18} />
      Manage Customers
    </div>
    {customersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
  </button>

  {customersExpanded && (
    <div className="ml-6 space-y-2 mt-2">
      <button
        onClick={goToCustomerForm}
        className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap w-full text-left ${
          location.pathname === "/CustomerForm"
            ? "text-blue-600 font-semibold"
            : "text-black"
        }`}
      >
        <UserPlus size={16} />
        Add New Customer
      </button>

      <button
        onClick={goToListOfConsumers}
        className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap w-full text-left ${
          location.pathname === "/list-of-consumers"
            ? "text-blue-600 font-semibold"
            : "text-black"
        }`}
      >
        <Users size={16} />
        List of Customers
      </button>

<button
  onClick={goToOnboardedConsumers}
  className={`flex items-center gap-2 px-2 py-1 w-full text-left overflow-hidden text-ellipsis whitespace-nowrap ${
    location.pathname === "/OnboardedConsumers"
      ? "text-blue-600 font-semibold"
      : "text-black"
  }`}
>
  <UserRoundCheck size={16} />
  <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
    Onboarded Consumers
  </span>
</button>

    </div>
  )}
</div>


{roles.includes("ROLE_SUPER_ADMIN") && (
  <button 
    onClick={goToOrganizations}
    className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
      location.pathname === "/organizations"
        ? "text-blue-600 font-semibold"
        : "text-black"
    }`}
  >
    <Building size={18} />
    Organizations
  </button>
)}

{roles.includes("ROLE_SUPER_ADMIN") && (
  <button 
    onClick={goToAdminManagement}
    className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
      location.pathname === "/admin-management"
        ? "text-blue-600 font-semibold"
        : "text-black"
    }`}
  >
    <Shield size={18} />
    Role Management
  </button>
)}

{(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN") || roles.includes("ROLE_AGENCY_ADMIN")) && (
  <button 
    onClick={goToUserManagement}
    className={`flex items-center gap-2 px-2 py-1 whitespace-nowrap ${
      location.pathname === "/user-management"
        ? "text-blue-600 font-semibold"
        : "text-black"
    }`}
  >
    <UserCheck size={18} />
    User Management
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
