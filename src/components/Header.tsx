import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Building, User, Bell, Settings, Menu } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';
import { Logo } from './ui';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userClaims } = useUser();
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on an auth page
  const authPages = ['/login', '/PasswordReset', '/Verification', '/ChangePassword', '/PageNotFound'];
  const isAuthPage = authPages.includes(location.pathname);

  useEffect(() => {
    const orgName = localStorage.getItem('selectedOrganizationName');
    setSelectedOrgName(orgName || '');
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

  const handleOrgChange = (orgId: string, orgName: string) => {
    localStorage.setItem('selectedOrganization', orgId);
    localStorage.setItem('selectedOrganizationName', orgName);
    setSelectedOrgName(orgName);
    setShowOrgDropdown(false);
    
    // Trigger custom event for components to listen to org changes
    window.dispatchEvent(new CustomEvent('organizationChanged', { detail: { orgId, orgName } }));
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Navigate to login page
    navigate('/login');
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  const isSuperAdmin = userClaims?.global_roles?.includes('ROLE_SUPER_ADMIN');

  // Don't render header on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <header className={`bg-white dark:bg-secondary-800 shadow-soft border-b border-secondary-200 dark:border-secondary-700 px-4 py-3 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarOpen ? 'md:left-64' : 'left-0'}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Mobile menu and Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden p-2"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo and Organization - Only show when sidebar is closed */}
          {!sidebarOpen && (
            <div className="flex items-center gap-4">
              <Logo size="xl" />
              {selectedOrgName && !isSuperAdmin && (
                <div className="hidden md:flex items-center gap-2 text-secondary-700 dark:text-secondary-300">
                  <Building className="h-4 w-4" />
                  <span className="font-medium text-sm">{selectedOrgName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Organization Selector (only for non-super admins with multiple orgs) */}
          {!isSuperAdmin && userClaims?.org_roles && Object.keys(userClaims.org_roles).length > 1 && (
            <div className="relative" ref={orgDropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                leftIcon={<Building className="h-4 w-4" />}
                rightIcon={<ChevronDown className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">Switch Org</span>
              </Button>
              
              {showOrgDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-800 rounded-xl shadow-large border border-secondary-200 dark:border-secondary-700 z-50 animate-slide-down">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-secondary-100 dark:border-secondary-700">
                      <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">Select Organization</h3>
                    </div>
                    {Object.entries(userClaims.org_roles).map(([orgId, orgData]: [string, any]) => (
                      <button
                        key={orgId}
                        onClick={() => handleOrgChange(orgId, orgData.org_name)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors ${
                          orgData.org_name === selectedOrgName ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600' : 'text-secondary-700 dark:text-secondary-300'
                        }`}
                      >
                        <div className="font-medium">{orgData.org_name}</div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{orgData.role.replace('ROLE_', '')}</div>
                      </button>
                    ))}
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
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              }
              rightIcon={<ChevronDown className="h-4 w-4 text-secondary-500 dark:text-secondary-400" />}
              className="px-3"
            >
              <span className="hidden sm:inline font-medium text-secondary-700 dark:text-secondary-300">
                {userClaims?.preferred_name || userClaims?.name || 'User'}
              </span>
            </Button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-800 rounded-xl shadow-large border border-secondary-200 dark:border-secondary-700 z-50 animate-slide-down">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                    <div className="font-medium text-secondary-900 dark:text-secondary-100">
                      {userClaims?.preferred_name || userClaims?.name || 'User'}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                      {isSuperAdmin ? 'Super Admin' : selectedOrgName}
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2 transition-colors"
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