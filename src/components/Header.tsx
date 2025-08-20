import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Building, User, Shield, Check } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import Button from './ui/Button';
import { Logo } from './ui';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userClaims } = useUser();
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const authPages = ['/login', '/PasswordReset', '/Verification', '/ChangePassword', '/PageNotFound'];
  const isAuthPage = authPages.includes(location.pathname);

  useEffect(() => {
    
    const selectedOrgStr = localStorage.getItem('selectedOrg');
    if (selectedOrgStr) {
      try {
        const selectedOrg = JSON.parse(selectedOrgStr);
        setSelectedOrgName(selectedOrg.orgName || '');
        setSelectedRole(selectedOrg.role || '');
      } catch (error) {
        console.error('Error parsing selectedOrg from localStorage:', error);
      }
    }
  }, [userClaims]);

  useEffect(() => {
    const storedState = localStorage.getItem('sidebarOpen');
    setSidebarOpen(storedState === 'true');
    
    const handleStorageChange = () => {
      const newState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(newState === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const handleOrgChange = (orgId: string, orgName: string, role: string) => {
  const newOrg = { orgId, orgName, role };

  
  localStorage.setItem('selectedOrg', JSON.stringify(newOrg));

  setSelectedOrgName(orgName);
  setSelectedRole(role);
  setShowOrgDropdown(false);

  
  window.dispatchEvent(new CustomEvent('organizationChanged', { detail: newOrg }));

  if(newOrg.role === "ROLE_AGENCY_REPRESENTATIVE" || newOrg.role === "ROLE_ORG_REPRESENTATIVE"){
    navigate('/RepresentativeDashboard');
  }else if(newOrg.role === "ROLE_ORG_ADMIN"){
    navigate('/AdminDashboard');
  }else if(newOrg.role === "ROLE_AGENCY_ADMIN"){
    navigate('/AgencyAdminDashboard');
  }else if(newOrg.role === "ROLE_ORG_STAFF" || newOrg.role === "ROLE_AGENCY_STAFF"){
    navigate('/StaffDashboard');
  }else if(newOrg.role === "ROLE_SUPER_ADMIN"){
    navigate('/SuperAdminDashboard');
  }

  window.location.reload();
};


  const handleLogout = () => {
    localStorage.removeItem("selectedRepresentative");
    localStorage.removeItem("selectedOrg");
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const isSuperAdmin = userClaims?.global_roles?.includes('ROLE_SUPER_ADMIN');

  if (isAuthPage) {
    return null;
  }

  return (
    <header className={`bg-white dark:bg-secondary-800 shadow-soft border-b border-secondary-200 dark:border-secondary-700 fixed top-0 right-0 z-30 transition-all duration-300 ${
      sidebarOpen 
        ? 'md:left-64 left-0' 
        : 'left-0 md:left-0'
    }`}>
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 w-full">
        
        <div className="flex items-center gap-2 sm:gap-4">
          
          {!sidebarOpen && (
            <div className="hidden md:block pl-10">
              <Logo className="w-20 h-20" />
            </div>
          )}

          
          <div className="flex items-center gap-3">
            {/* Super Admin Display */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 text-secondary-700 dark:text-secondary-200">
                <Shield className="h-4 w-4 text-primary-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Super Admin</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">System Administrator</span>
                </div>
              </div>
            )}

            {/* Organization and Role Display */}
            {selectedOrgName && selectedRole && !isSuperAdmin && (
              <div className="flex items-center gap-2 text-secondary-700 dark:text-secondary-200">
                <Building className="h-4 w-4 text-primary-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{selectedOrgName}</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    {selectedRole.replace('ROLE_', '').replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Right side - User controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          
          {/* Theme toggle removed */}

          {/* Notifications - Hide on very small screens 
          <Button
            variant="ghost"
            size="sm"
            className="p-1 sm:p-2"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>*/}

          {/* Organization Selector (only for non-super admins with multiple orgs) */}
          {!isSuperAdmin && userClaims?.org_roles && Object.keys(userClaims.org_roles).length > 1 && (
            <div className="relative" ref={orgDropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                leftIcon={<Building className="h-4 w-4" />}
                rightIcon={<ChevronDown className="h-4 w-4" />}
                className="flex"
              >
                <span className="hidden sm:inline">Switch Org</span>
              </Button>
              
              {showOrgDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-secondary-800 rounded-xl shadow-large border border-secondary-200 dark:border-secondary-700 z-50 animate-slide-down">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                      <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">Select Organization</h3>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">Choose your organization and role</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {Object.entries(userClaims.org_roles).map(([orgId, orgData]: [string, any]) => {
                        const isSelected = orgData.org_name === selectedOrgName && orgData.role === selectedRole;
                        return (
                          <button
                            key={orgId}
                            onClick={() => handleOrgChange(orgId, orgData.org_name, orgData.role)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors border-l-3 ${
                              isSelected 
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-primary-600' 
                                : 'text-secondary-700 dark:text-secondary-300 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{orgData.org_name}</div>
                                <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                  {orgData.role.replace('ROLE_', '').replace('_', ' ')}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="flex items-center">
                                  <Check className="h-4 w-4 text-primary-600" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              leftIcon={
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              }
              rightIcon={<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-600 dark:text-secondary-300" />}
              className="px-2 sm:px-3"
            >
              <span className="hidden lg:inline font-medium text-secondary-700 dark:text-secondary-300">
                {userClaims?.preferred_name || userClaims?.name || 'User'}
              </span>
            </Button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white dark:bg-secondary-800 rounded-xl shadow-large border border-secondary-200 dark:border-secondary-700 z-50 animate-slide-down">
                <div className="py-2">
                  <div className="px-3 sm:px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                    <div className="font-medium text-secondary-900 dark:text-secondary-100 text-sm">
                      {userClaims?.preferred_name || userClaims?.name || 'User'}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                      {isSuperAdmin ? 'Super Admin' : selectedOrgName}
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;