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

      // ✅ 1. Check password change requirement
      if (!claims.has_password_changed) {
        setRedirectPath('/password-reset');
        return;
      }

      // ✅ 2. Global Super Admin shortcut
      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        setRedirectPath('/super-admin-dashboard');
        return;
      }

      // ✅ 3. Extract org roles
      const orgRoles = claims.org_roles ? Object.entries(claims.org_roles) : [];

      if (orgRoles.length === 0) {
        setRedirectPath('/login');
        return;
      }

      // ✅ 4. If user has exactly one org, select it automatically
      if (orgRoles.length === 1) {
        const [orgId, orgRole] = orgRoles[0];
        const role = orgRole.role;

        localStorage.setItem(
          'selectedOrg',
          JSON.stringify({
            orgId,
            orgName: orgRole.org_name,
            role,
          })
        );

        routeByOrgRole(role);
        return;
      }

      // ✅ 5. If multiple orgs, validate selectedOrg against claims
      const selectedOrg = localStorage.getItem('selectedOrg');
      if (!selectedOrg) {
        // No org selected yet -> force login (or could redirect to org selector page)
        setRedirectPath('/login');
        return;
      }

      try {
        const parsedOrg = JSON.parse(selectedOrg);

        // ✅ Cross-check: ensure orgId from localStorage exists in claims.org_roles
        const matchingOrg = orgRoles.find(([orgId]) => orgId === parsedOrg.orgId);

        if (!matchingOrg) {
          // ⚠️ LocalStorage org is invalid -> logout
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('selectedOrg');
          setRedirectPath('/login');
          return;
        }

        // ✅ Valid org, but update localStorage with latest data from claims
        const [orgId, orgRole] = matchingOrg;
        localStorage.setItem(
          'selectedOrg',
          JSON.stringify({
            orgId,
            orgName: orgRole.org_name,
            role: orgRole.role,
          })
        );

        routeByOrgRole(orgRole.role);
      } catch (error) {
        console.error("Failed to parse selectedOrg:", error);
        localStorage.removeItem('selectedOrg');
        setRedirectPath('/login');
      }
    };

    const routeByOrgRole = (role: string) => {
      switch (role) {
        case 'ROLE_ORG_ADMIN':
          setRedirectPath('/org-admin-dashboard');
          break;
        case 'ROLE_AGENCY_ADMIN':
          setRedirectPath('/agency-admin-dashboard');
          break;
        case 'ROLE_ORG_STAFF':
        case 'ROLE_AGENCY_STAFF':
          setRedirectPath('/staff-dashboard');
          break;
        case 'ROLE_ORG_REPRESENTATIVE':
        case 'ROLE_AGENCY_REPRESENTATIVE':
          setRedirectPath('/representative-dashboard');
          break;
        case 'ROLE_CUSTOMER':
          setRedirectPath('/manage-customers');
          break;
        default:
          // Invalid role -> logout
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('selectedOrg');
          setRedirectPath('/login');
      }
    };

    redirectBasedOnRole();
  }, []);

  if (!redirectPath) return null;

  return <Navigate to={redirectPath} />;
};

export default HomeRedirect;
