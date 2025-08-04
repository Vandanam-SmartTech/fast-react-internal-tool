// pages/HomeRedirect.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const HomeRedirect: React.FC = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      const token = localStorage.getItem('jwtToken');
      const selectedOrgId = localStorage.getItem('selectedOrganization');

      if (!token) {
        setRedirectPath('/login');
        return;
      }

      const claims = await fetchClaims();
      if (!claims) {
        setRedirectPath('/login');
        return;
      }

      const isPasswordChanged = claims.is_password_changed;
      if (!isPasswordChanged) {
        setRedirectPath('/PasswordReset');
        return;
      }

      // Super admin doesn't need org selection
      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        setRedirectPath('/SuperAdminDashboard');
        return;
      }

      // Check if user has organization roles and selected org
      if (!selectedOrgId || !claims.org_roles) {
        setRedirectPath('/login');
        return;
      }

      // Find user's role in selected organization
      const orgData = claims.org_roles[selectedOrgId];
      if (!orgData || !orgData.role) {
        setRedirectPath('/login');
        return;
      }

      // Route based on organization-specific role
      switch (orgData.role) {
        case 'ROLE_ORG_ADMIN':
          setRedirectPath('/AdminDashboard');
          break;
        case 'ROLE_AGENCY_ADMIN':
          setRedirectPath('/AgencyAdminDashboard');
          break;
        case 'ROLE_STAFF':
          setRedirectPath('/StaffDashboard');
          break;
        case 'ROLE_REPRESENTATIVE':
          setRedirectPath('/RepresentativeDashboard');
          break;
        case 'ROLE_CUSTOMER':
          setRedirectPath('/manage-customers'); // Default for customers
          break;
        default:
          setRedirectPath('/login');
      }
    };

    redirectBasedOnRole();
  }, []);

  if (!redirectPath) return null;

  return <Navigate to={redirectPath} />;
};

export default HomeRedirect;
