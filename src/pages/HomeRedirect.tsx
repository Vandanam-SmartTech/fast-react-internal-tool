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
        const [orgId, orgData] = orgRoles[0];
        const role = orgData.roles[0]; // pick first role as default

        localStorage.setItem(
          'selectedOrg',
          JSON.stringify({
            orgId,
            orgName: orgData.org_name,
            role,
          })
        );

        routeByOrgRole(role);
        return;
      }

      // ✅ 5. If multiple orgs, validate selectedOrg against claims
      const selectedOrgRaw = localStorage.getItem('selectedOrg');
      if (!selectedOrgRaw) {
        // No org selected yet -> redirect to login or org selector page
        setRedirectPath('/login');
        return;
      }

      try {
        const parsedOrg = JSON.parse(selectedOrgRaw);

        // ✅ Cross-check: ensure orgId from localStorage exists in claims.org_roles
        const matchingOrg = orgRoles.find(([orgId]) => orgId === parsedOrg.orgId);
        if (!matchingOrg) {
          // Invalid org -> logout
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('selectedOrg');
          setRedirectPath('/login');
          return;
        }

        // ✅ Valid org, but update localStorage with latest data from claims
        const [orgId, orgData] = matchingOrg;

        const roleToUse =
          parsedOrg.role && orgData.roles.includes(parsedOrg.role)
            ? parsedOrg.role
            : orgData.roles[0];

        localStorage.setItem(
          'selectedOrg',
          JSON.stringify({
            orgId,
            orgName: orgData.org_name,
            role: roleToUse,
          })
        );

        routeByOrgRole(roleToUse);
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
        case 'ROLE_GRAMSEVAK':
          setRedirectPath('/grampanchayat-dashboard');
          break;
        case 'ROLE_BDO':
          setRedirectPath('/bdo-dashboard');
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
