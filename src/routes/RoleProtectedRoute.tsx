import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const [authorized, setAuthorized] = useState<null | boolean>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setRedirectPath('/login');
        return;
      }

      const claims = await fetchClaims();
      if (!claims) {
        setRedirectPath('/login');
        return;
      }

      // ✅ 1. Check global_roles first
      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        if (allowedRoles.includes('ROLE_SUPER_ADMIN')) {
          setAuthorized(true);
        } else {
          setRedirectPath('/SuperAdminDashboard');
        }
        return;
      }

      // ✅ 2. Extract all org-specific roles
      const orgRoles = claims.org_roles
        ? Object.values(claims.org_roles).map(org => org.role)
        : [];

      if (orgRoles.length === 0) {
        setRedirectPath('/login');
        return;
      }

      // ✅ 3. Multiple roles → check for selectedOrg in localStorage
      if (orgRoles.length > 1) {
        const selectedOrg = localStorage.getItem('selectedOrg');
        if (!selectedOrg) {
          setRedirectPath('/login');
          return;
        }
      }

      // ✅ 4. Check if any of the orgRoles match allowedRoles
      const isAuthorized = allowedRoles.some(role => orgRoles.includes(role));

      if (isAuthorized) {
        setAuthorized(true);
      } else {
        // ✅ 5. Redirect to first available dashboard if unauthorized
        const firstRole = orgRoles[0];
        switch (firstRole) {
          case 'ROLE_ORG_ADMIN':
            setRedirectPath('/AdminDashboard');
            break;
          case 'ROLE_AGENCY_ADMIN':
            setRedirectPath('/AgencyAdminDashboard');
            break;
          case 'ROLE_ORG_STAFF':
            setRedirectPath('/StaffDashboard');
            break;
          case 'ROLE_AGENCY_STAFF':
            setRedirectPath('/StaffDashboard');
            break;
          case 'ROLE_ORG_REPRESENTATIVE':
            setRedirectPath('/RepresentativeDashboard');
            break;
          case 'ROLE_AGENCY_REPRESENTATIVE':
            setRedirectPath('/RepresentativeDashboard');
            break;
          case 'ROLE_CUSTOMER':
            setRedirectPath('/manage-customers');
            break;
          default:
            setRedirectPath('/login');
        }
      }
    };

    checkAccess();
  }, [allowedRoles]);

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  if (authorized === null) {
    return null; // Optionally add loading spinner
  }

  return children;
};

export default RoleProtectedRoute;
