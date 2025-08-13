// pages/HomeRedirect.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const HomeRedirect: React.FC = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
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

      // 1️⃣ Check password change
      if (!claims.is_password_changed) {
        setRedirectPath('/PasswordReset');
        return;
      }

      // 2️⃣ Global role check
      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        setRedirectPath('/SuperAdminDashboard');
        return;
      }

      // 3️⃣ Extract org roles
      const orgRoles = claims.org_roles ? Object.values(claims.org_roles) : [];

      if (orgRoles.length === 0) {
        setRedirectPath('/login');
        return;
      }

      if (orgRoles.length === 1) {
        // Only one role → redirect automatically
        const role = orgRoles[0].role;
        routeByOrgRole(role);
        return;
      }

      // 4️⃣ Multiple roles
      const selectedOrg = localStorage.getItem('selectedOrg');
      if (!selectedOrg) {
        // No org selected → go to login
        setRedirectPath('/login');
        return;
      }

      try {
        const parsedOrg = JSON.parse(selectedOrg);
        routeByOrgRole(parsedOrg.role);
      } catch (error) {
        setRedirectPath('/login');
      }
    };

    const routeByOrgRole = (role: string) => {
      switch (role) {
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
          setRedirectPath('/manage-customers');
          break;
        default:
          setRedirectPath('/login');
      }
    };

    redirectBasedOnRole();
  }, []);

  if (!redirectPath) return null; // Or a loading spinner

  return <Navigate to={redirectPath} />;
};

export default HomeRedirect;
