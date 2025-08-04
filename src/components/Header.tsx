import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Building, User } from 'lucide-react';
import { fetchClaims } from '../services/jwtService';
import defaultLogo from '../assets/Vandanam_SmartTech_Logo.png';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userClaims, setUserClaims] = useState<any>(null);
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const claims = await fetchClaims();
        setUserClaims(claims);
        
        const orgName = localStorage.getItem('selectedOrganizationName');
        setSelectedOrgName(orgName || '');
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
    
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
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('selectedOrganization');
    localStorage.removeItem('selectedOrganizationName');
    navigate('/login');
  };

  const isSuperAdmin = userClaims?.roles?.includes('ROLE_SUPER_ADMIN');

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 px-4 py-3 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-0'}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Organization Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={defaultLogo} 
            alt="Organization Logo" 
            className="h-10 w-auto"
          />
          {selectedOrgName && !isSuperAdmin && (
            <div className="flex items-center gap-2 text-gray-700">
              <Building className="h-4 w-4" />
              <span className="font-medium">{selectedOrgName}</span>
            </div>
          )}
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center gap-4">
          {/* Organization Selector (only for non-super admins with multiple orgs) */}
          {!isSuperAdmin && userClaims?.org_roles && Object.keys(userClaims.org_roles).length > 1 && (
            <div className="relative" ref={orgDropdownRef}>
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Building className="h-4 w-4" />
                <span>Switch Org</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showOrgDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    {Object.entries(userClaims.org_roles).map(([orgId, orgData]: [string, any]) => (
                      <button
                        key={orgId}
                        onClick={() => handleOrgChange(orgId, orgData.org_name)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          orgData.org_name === selectedOrgName ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{orgData.org_name}</div>
                        <div className="text-xs text-gray-500">{orgData.role.replace('ROLE_', '')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">
                {userClaims?.preferred_name || userClaims?.name || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-medium text-gray-900">
                      {userClaims?.preferred_name || userClaims?.name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isSuperAdmin ? 'Super Admin' : selectedOrgName}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
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