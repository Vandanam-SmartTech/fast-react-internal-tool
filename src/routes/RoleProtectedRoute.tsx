import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const [authorized, setAuthorized] = useState<null | boolean>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
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

      // Check global roles first (ROLE_SUPER_ADMIN)
      const globalRoles = claims.global_roles || [];
      const hasGlobalRole = allowedRoles.some(role => globalRoles.includes(role));
      
      if (hasGlobalRole) {
        setAuthorized(true);
        return;
      }

      // Check organization-specific roles
      if (!selectedOrgId || !claims.org_roles) {
        setRedirectPath('/login');
        return;
      }

      const orgData = claims.org_roles[selectedOrgId];
      if (!orgData || !orgData.role) {
        setRedirectPath('/login');
        return;
      }

      const hasOrgRole = allowedRoles.includes(orgData.role);
      
      if (hasOrgRole) {
        setAuthorized(true);
      } else {
        // Redirect to user's appropriate dashboard
        setRedirectPath('/');
      }
    };

    checkAccess();
  }, [allowedRoles]);

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  if (authorized === null) {
    return null; 
  }

  return children;
};

export default RoleProtectedRoute;
