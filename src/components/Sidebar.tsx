import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./ui"; 
import { 
  Home, 
  UserPlus, 
  Users, 
  UserRoundCheck, 
  LogOut, 
  UserCog, 
  UsersRound, 
  Building, 
  Shield, 
  UserCheck, 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  ChevronDown, 
  ChevronRight,
  Settings,
  FileText,
  BarChart3
} from "lucide-react";
import { fetchClaims } from "../services/jwtService";
import Button from "./ui/Button";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [customersExpanded, setCustomersExpanded] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
  // Check if we're on an auth page
  const authPages = ['/login', '/PasswordReset', '/Verification', '/ChangePassword', '/PageNotFound'];
  const isAuthPage = authPages.includes(location.pathname);
  
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarOpen", newState.toString());
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Navigate to login page
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

  const goToDocuments = () => {
    navigate("/generatedocuments");
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isCustomersActive = () => {
    return ['/manage-customers', '/CustomerForm', '/list-of-consumers', '/OnboardedConsumers'].includes(location.pathname);
  };

  // Don't render sidebar on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Toggle button for smaller screens */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="fixed top-3 left-2 z-50 p-2 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </Button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <div
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-secondary-800 shadow-large border-r border-secondary-200 dark:border-secondary-700 z-40 transition-transform duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-primary-50 to-solar-50 dark:from-primary-900/20 dark:to-solar-900/20">
            <div className="flex items-center justify-center w-full">
              <Logo size="xl" className="mx-auto" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-1 h-8 w-8 text-secondary-700 dark:text-secondary-300 hover:text-error-600 dark:hover:text-error-400"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {/* Dashboard */}
              <button
                onClick={handleHomeClick}
                className={`nav-link w-full justify-start ${
                  isActive("/AdminDashboard") || isActive("/RepresentativeDashboard") || 
                  isActive("/SuperAdminDashboard") || isActive("/AgencyAdminDashboard") || 
                  isActive("/StaffDashboard")
                    ? "nav-link-active"
                    : "nav-link-inactive"
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>


              {/* Manage Customers Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setCustomersExpanded(!customersExpanded)}
                  className={`nav-link w-full justify-between ${
                    isCustomersActive() ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={20} />
                    <span>Customers</span>
                  </div>
                  {customersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {customersExpanded && (
                  <div className="ml-6 space-y-1 mt-2">
                    <button
                      onClick={goToCustomerForm}
                      className={`nav-link w-full justify-start ${
                        isActive("/CustomerForm") ? "nav-link-active" : "nav-link-inactive"
                      }`}
                    >
                      <UserPlus size={18} />
                      <span>Add Customer</span>
                    </button>

                    <button
                      onClick={goToListOfConsumers}
                      className={`nav-link w-full justify-start ${
                        isActive("/list-of-consumers") ? "nav-link-active" : "nav-link-inactive"
                      }`}
                    >
                      <Users size={18} />
                      <span>All Customers</span>
                    </button>

                    <button
                      onClick={goToOnboardedConsumers}
                      className={`nav-link w-full justify-start ${
                        isActive("/OnboardedConsumers") ? "nav-link-active" : "nav-link-inactive"
                      }`}
                    >
                      <UserRoundCheck size={18} />
                      <span>Onboarded</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Documents */}
             

              {/* Organizations (Super Admin) */}
              {roles.includes("ROLE_SUPER_ADMIN") && (
                <button 
                  onClick={goToOrganizations}
                  className={`nav-link w-full justify-start ${
                    isActive("/organizations") ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  <Building size={20} />
                  <span>Organizations</span>
                </button>
              )}

              {/* Role Management (Super Admin) */}
              {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN")) && (
                <button 
                  onClick={goToAdminManagement}
                  className={`nav-link w-full justify-start ${
                    isActive("/admin-management") ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  <Shield size={20} />
                  <span>Role Management</span>
                </button>
              )}

              {/* User Management */}
              {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN") || roles.includes("ROLE_AGENCY_ADMIN")) && (
                <button 
                  onClick={goToUserManagement}
                  className={`nav-link w-full justify-start ${
                    isActive("/user-management") ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  <UserCheck size={20} />
                  <span>User Management</span>
                </button>
              )}

              {/* Settings */}
              <button
                className="nav-link-inactive w-full justify-start"
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
              <button
                onClick={handleLogout}
                className="nav-link-inactive w-full justify-start text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
